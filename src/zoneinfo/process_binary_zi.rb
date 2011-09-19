#!/usr/bin/env ruby

require 'rubygems'
require 'json'
require 'find'
require 'gregorian-calendar'

$zidir = "/usr/share/zoneinfo"
$exceptions = 'leapseconds localtime factory iso3166.tab zone.tab +VERSION yearistype.sh'
$showleaps = false
# set to nil or to debug
$debugzone = nil

class ProcessBinaryZI
  Exceptions = $exceptions.split(/\s+/)
  
  def main(compdir,bindir,reportfile)
    # get the filenames
    data = {}
    files = {}
    badfiles = {}
    rawfiles = []
    # find all files in the path
    Find.find(bindir) {|f|
      # ignore directories
      next if File.directory?(f)
      # ignore dotfiles
      next if f =~ /\/\.[^\/]*$/
      # keep only the relative path
      f.slice!(bindir+'/')
      rawfiles.push(f)
    }
    rawfiles.each {
      |filename|
      # is it an exception file?
      if Exceptions.index(filename.downcase).nil? then
        begin
          pathname = bindir+'/'+filename
          size = File.size(pathname)
          f = File.open(pathname)
          files[filename] = f.read(size)
          f.close
        rescue StandardError => err
          # report any bad files
          badfiles[filename] = err
        end
      end
    }
    
    data = {}
    files.each {|key,value| data[key] = process_file(key,value)}
    # now load the comp files
    compdata = {}
    files.each {|key,value|
      next if key =~ /posixrules/
      pathname = compdir + '/' + key
      size = File.size(pathname)
      f = File.open(pathname)
      s = f.read(size)
      f.close
      # save the data from JSON
      compdata[key] = JSON.parse(s)
    }
    
    # generate the comparison report
    goodzones = []
    badzones = []

    files.keys.sort.each {|zone|
      # ignore the posixrules zone
      next if zone =~ /posixrules/
      # zone name
      rep = []
      
      # leaps section
      if ($showleaps) then
        rep.push("\tleaps")
        dlen = data[zone]['leaps'].length
        clen = compdata[zone]['leaps'].length
        len = [dlen,clen].max
        for i in 0...len
          di = i < dlen ? data[zone]['leaps'][i][0] : '""'
          ci = i < clen ? compdata[zone]['leaps'][i][0] : '""'
          rep.push("\t\t"+i.to_s+": "+di.to_s+"\t"+ci.to_s)
        end
      end
      
      # types section
      dd = {}
      dmiss = []
      cd = {}
      cmiss = []
      data[zone]['types'].each {|x| dd[x.join(':')] = true }
      compdata[zone]['types'].each {|x| cd[x.join(':')] = true }
      # now see what appears in one and not the other
      dd.keys.each {|x| cmiss.push(x) if ! cd.key?(x) }
      cd.keys.each {|x| dmiss.push(x) if ! dd.key?(x) }
      if dmiss.length > 0 || cmiss.length > 0 then
        rep.push("\ttypes")
        dmiss.sort.each {|x| rep.push("\t\t\t\t\t\t\t\t\t\t>>"+x)}
        cmiss.sort.each {|x| rep.push("\t\t<<"+x)}
      end
      
      # transitions section
      dd = {}
      dmiss = []
      cd = {}
      cmiss = []
      # we need to be intelligent, and only report transitions that change things
      lastTx = nil
      data[zone]['transitions'].each {|x| 
        str = format(x[0])
        type = data[zone]['types'][x[1]].join(':')
        next if type == lastTx
        lastTx = type
        str += ':'+ type
        dd[str] = true 
      }
      lastTx = nil
      compdata[zone]['transitions'].each {|x| 
        str = format(x[0])
        type = compdata[zone]['types'][x[1]].join(':')
        next if type == lastTx
        lastTx = type
        str += ':'+ type
        cd[str] = true 
      }
      # now see what appears in one and not the other
      dd.keys.each {|x| cmiss.push(x) if ! cd.key?(x) }
      cd.keys.each {|x| dmiss.push(x) if ! dd.key?(x) }
      if dmiss.length > 0 || cmiss.length > 0 then
        rep.push("\ttransitions")
        dmiss.sort.each {|x| rep.push("\t\t\t\t\t\t\t\t\t\t>>"+x)}
        cmiss.sort.each {|x| rep.push("\t\t<<"+x)}
      end
      
      # debugging
      if zone == $debugzone then
        cd.keys.sort.each {|x| rep.push("\t\t\t\t\t\t\t\t\t\t>>"+x)}
        dd.keys.sort.each {|x| rep.push("\t\t<<"+x)}
      end
      
      if rep.length > 0 then
        badzones.push(zone)
        badzones += rep
      else
        goodzones.push(zone)
      end
    }
    f = reportfile.nil? ? $stdout : File.open(reportfile,"w")
    f.write("ERRORS: "+badzones.length.to_s+"\n")
    f.write(badzones.join("\n")+"\n")
    f.write("--------------------------\n")
    f.write("GOOD: "+goodzones.length.to_s+"\n")
    f.write(goodzones.join("\n")+"\n")
    if !reportfile.nil? then
      f.close
      puts "Results written to "+reportfile+"\n"
    end
    
    
  end

  def zeropad(arg)
    # make sure it is a string
    arg = arg.to_s
    arg = '0'+arg if arg.length < 2
    return arg
  end

  # to output a date format
  def format(secs)
    cal = GregorianCalendar.new(secs)
    return cal.year.to_s+'.'+zeropad(cal.month+1)+'.'+zeropad(cal.day+1)+'_'+zeropad(cal.hour)+':'+zeropad(cal.minute)+':'+zeropad(cal.second)
  end

  # convert from binary to Ruby objects
  def process_file(name,data)
    # position
    pos = 0
    # first 28 bytes are header information we do not care about
    pos+=28
    # get how many leap, time, type and char entries there are
    leapcnt = readLong(data.slice(pos,4),false)
    pos+=4
    timecnt = readLong(data.slice(pos,4),false)
    pos+=4
    typecnt = readLong(data.slice(pos,4),false)
    pos+=4
    charcnt = readLong(data.slice(pos,4),false)
    pos+=4
    
    # get the time transition entries
    transitions = []
    for i in 0...timecnt
      transitions.push([readLong(data.slice(pos,4),true)])
      pos += 4
    end
    
    for i in 0...timecnt
      # actually each is unsigned char
      transitions[i].push(data[pos])
      pos+=1
    end
    
    # get the type indicators
    types = []
    typesRaw = []
    for i in 0...typecnt
      offset = readLong(data.slice(pos,4),true)
      pos+=4
      # actually each is int
      dst = data[pos]
      pos+=1
      # actually each is unsigned int
      abbrind = data[pos]
      pos+=1
      typesRaw.push({'o'=>offset,'i'=>abbrind,'d'=>dst})
    end
    
    # next get the timezone abbrevation strings, which are not quite as easy to break down
    abbr = data.slice(pos,charcnt).to_s
    pos+=charcnt
    # now we need to go through each one of the types and find the associated string
    typesRaw.each {
      |type|
      index = type['i']
      # need to find the end of the string
      strend = index
      while abbr[strend] != 0
        strend+=1
      end
      type['n'] = abbr.slice(index...strend)
      type.delete('i')
      types.push([type['o'],type['d'],type['n']])
    }
    
    # finally we need the leaps
    leaps = []
    for i in 0...leapcnt
      tx = readLong(data.slice(pos,4),true)
      secs = readLong(data.slice(pos,4),true)
      leaps.push([tx,secs])
    end
    
    
    return {'leaps'=>leaps, 'types'=>types, 'transitions'=>transitions}
  end
  
  # binary of 182 : 10110110 (unsigned)
  # binary of -74 : 10110110 (signed)
  # binary of 74:   01001010
  # convert bytes into a long
  def readLong(bytes,signed)
    # handle sign as well
    a = bytes[0] & 0xff
    b = bytes[1] & 0xff
    c = bytes[2] & 0xff
    d = bytes[3] & 0xff
    if (!signed.nil? && signed && bytes[0] & 0x80 != 0) then
      # process with twos complement - invert the bits, bitwise and with 0xff, add 1, multiply by -1
      a = -1*((~a & 0xff)+1)
    end
    ret = (a << 24) | (b << 16) | (c << 8) | d
    return (ret)
  end
  
  # print the output as JSON to the given directory
  def output(data,dir)
    dir = Dir.new(dir)
    data.each {
      |name,zoneinfo|
      # make sure the directory exists
      filename = dir.path + '/' + name
      dirname = filename.slice(0,filename.rindex('/'))
      begin
        d = Dir.new(dirname)
        d.close
      rescue
        Dir.mkdir(dirname)
      end
      # open file for writing
      f = File.new(filename,"w")
      f.write(zoneinfo.to_json+"\n")
      f.close
    }
  end
end

if ARGV.length < 2 then
  puts $0 + " validate_directory binary_directory [reportfile]"
else
  ProcessBinaryZI.new.main(ARGV[0],ARGV[1],ARGV[2])
end
exit