#!/usr/local/bin/ruby

=begin
 Script to compile standard Elsie ZoneInfo files into a specialized JSON format
 The input is as given from http://www.twinsun.com/tz/tz-link.htm or ftp://elsie.nci.nih.gov/pub/
   The description of lines is given in the manpage for zic, or zic.8.txt

 The output is as follows:
 Process the JSON from a compiled zoneinfo file
 Format is:
 {
   transitions => [[1000,1],[1500,2],[1565,1],[2734,3],...],
   types =>[{'o'=>-36500,'n'=>'EDT','d'=>1},{'o'=>-36000,'n'=>'EST','d'=>0},...],
   leaps => [[1005,1],[2016,2],[3578,3],...]
 }
 
 Where 
    transitions = list in ascending order of pairs of numbers. The first number is seconds since Unix Epoch when a time discontinuity
                  takes place; the second number is an index into types as to what our state is after the transition.
    types = list of timezone states. Each is an object with the offset from UTC in seconds ('o'), the name ('n') and 1/0 for DST yes/no ('d')
    leaps = list of times when leap seconds occur. 
=end

require 'rubygems'
require 'json'
require 'date'
require 'gregorian-calendar'

$zonetabfilename = 'zone.tab'
$iso3166filename = 'iso3166.tab'
$leapfilename = 'leapseconds'
$PRIMARY_YDATA=	"africa antarctica asia australasia europe northamerica southamerica".split(/\s+/)
$YDATA=		$PRIMARY_YDATA + "pacificnew etcetera factory backward".split(/\s+/)
$NDATA=		"systemv".split(/\s+/)
$SDATA=		"solar87 solar88 solar89".split(/\s+/)
$TDATA=		$YDATA + $NDATA + $SDATA

$months = "jan feb mar apr may jun jul aug sep oct nov dec"
$weeks = "sun mon tue wed thu fri sat"
$maxyear = 30


class ZoneInfoCompiler
  Months = $months.split(/\s+/)
  Weeks = $weeks.split(/\s+/)
  Maxyear = Date.today().year+$maxyear 
  
  def initialize
    super()
  end
  
  def main(indir,outdir,processonly)
    # directory to work with
    dir = Dir.new(indir+'/src')
    dir.path =~ /\/?(\d+\w+)\/?\/src/
    version = $1
    
    zones = {'version' => version, 'zone' => {}, 'rule' => {}, 'link' => {}, 'zonelist' => {}, 'normalized' => {}}
    
    
    # load the leapsecond file - and catch error
    begin
      # process the leapsecond file if it exists
      leapfile = File.open(dir.path+'/'+$leapfilename)
      lines = leapfile.readlines
      leapfile.close
      leaps = process_leaps(lines) 
    rescue
      leaps = false
    end
    
    # process the zonelist
    begin
      # zone.tab
      tabfile = File.open(dir.path+'/'+$zonetabfilename)
      zonelines = tabfile.readlines
      tabfile.close
      # iso3166.tab
      tabfile = File.open(dir.path+'/'+$iso3166filename)
      iso3166lines = tabfile.readlines
      tabfile.close
      # process them
      zones['zonelist'] = process_zonelist(zonelines,iso3166lines)
    rescue
    end
    
    files = Hash.new
    badfiles = Hash.new
    # load each file
    processonly = $TFILES if processonly.nil?
    processonly.each {
      |filename| 
      # is it an exception file?
      if (filename != $leapfilename && filename !~ /^\./ && filename !~ /\.(tab|sh)?$/) then
        begin
          f = File.open(dir.path+'/'+filename)
          files[filename] = f.readlines
          f.close
        rescue StandardError => err
          # report any bad files
          badfiles[filename] = err
        end
      end
    }
    
    # process each file
    files.each {|key,value| process_file(key,value,zones)}
    
    # reconstruct the rules for each zone as a series of changes including leapsecond changes
    zones['zone'].keys.each {|name|
      zones['normalized'][name] = normalize_zone(name,zones['zone'][name],zones['rule'],leaps)
    }
    
    # copy links for JSON support
    zones['link'].each {|name,source| zones['normalized'][name] = deep_clone(zones['normalized'][source])}
    
    # print our output as JSON files
    output(zones,outdir)
    
    # complete
    puts 'Success:'
    files.each_key {|filename| puts "\t"+filename}
    puts 'Failure:'
    badfiles.each {|filename,err| puts "\t"+filename+': ' + err}
  end
  
  # process the zonelist
  def process_zonelist(zones,countries)
    c = Hash.new
    z = Hash.new
    # make an entry for each country
    countries.each {
      |line|
      # ignore blank and comment lines
      next if line =~ /(^\s*$|^\s*#)/
      p = line.chomp.split(/\s+/,2)
      c[p[0]] = {'name' => p[1]}
    }
    # add the entries for each zone
    zones.each {
      |line|
      # ignore blank and comment lines
      if line =~ /(^\s*$|^\s*#)/ then
        next
      end
      p = line.chomp.split(/\s+/,4)
      # save the list of zones in a given country
      if c[p[0]].nil? then
        c[p[0]] = {}
      end
      if c[p[0]]['zones'].nil? then
        c[p[0]]['zones'] = []
      end
      c[p[0]]['zones'].push(p[2])
      # save the information about each zone
      h = {'coordinates'=>p[1],'country'=>p[0]}
      if !p[3].nil? then
        h['comments'] = p[3]
      end
      z[p[2]]=h
    }
    # sort the list of zones in each country alphabetically
    c.each {
      |name,data|
      if !data['zones'].nil? then
        data['zones'].sort!
      end
    }
    ret = {'countries'=>c,'zones'=>z}
    return ret
  end
  
  # process the leapsecond information
  # each line is: Leap  YEAR  MONTH  DAY  HH:MM:SS  CORR  R/S
  # S => UTC; R => walltime
  def process_leaps(lines)
    ret = []
     lines.each {
      |line|
      # ignore blank and comment lines
      if line =~ /(^\s*$|^\s*#)/ then
        next
      end
      p = line.split
      tod = timeOfDayProcessor(p[4])
      ret.push({'year' => p[1].to_i, 'month' => monthNameProcessor(p[2]), 'day' => p[3].to_i-1,
                'time' => timeOfDayToSeconds(tod), 
                'add' => p[5] == '+' ? 1 : -1, 'UTC' => p[6].slice(0,1).downcase == 's'})
     }
     return(ret)
  end
  
  # deep clone a hash
  def deep_clone(obj)
    return Marshal.load(Marshal.dump(obj))
  end
  
  # print the output as JSON to the given directory
  def output(data,dir)
    dir = Dir.new(dir)
    data['normalized'].each {
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
    # write the zones file
    f = File.new(dir.path+'/'+'zones',"w")
    f.write(data['zonelist'].to_json+"\n")
    f.close
    
    # write the version file
    f = File.new(dir.path+'/'+'+VERSION',"w")
    f.write(data['version'])
    f.close
    
  end
  
  
  # process a file - blank/comment lines, zone lines, rule lines, link lines
  # the name does not really matter, just for references
  def process_file(filename,lines,zones)
    currentZone = nil
    lines.each {
      |line|
      # ignore comments and blank lines, as well as stripping comments from ends of line
      line = decomment(line)
      if line =~ /^\s*$/ then
        next
      elsif line =~ /^\s*Zone\s+(\S+)\s+(.*)$/ then
        name = $1
        currentZone = name
        # make sure the zone exists
        if !zones['zone'].has_key?(name) then
          zones['zone'][name] = []
        end
        zones['zone'][name].push(process_zone($2,filename))
      elsif line =~ /^\s*Link\s+(\S+)\s+(\S+)\s*$/ then
        currentZone = nil
        zones['link'][$2] = $1
      elsif line =~ /^\s*Rule\s+(\S+)\s+(.*)$/ then
        currentZone = nil
        name = filename+':'+$1
        # make sure the correct section exists
        if !zones['rule'].has_key?(name) then
          zones['rule'][name] = []
        end
        zones['rule'][name].push(process_rule($2))
      elsif !currentZone.nil? then
        zones['zone'][currentZone].push(process_zone(line,filename))
      end
    }
  end
  
  # convert a month name to a number
  def monthNameProcessor(name)
    # simple rule: take the first 3 letters of the name, lower case it, look it up
    return Months.index(name.slice(0,3).downcase)
  end
  
  def weekNameProcessor(name)
    return Weeks.index(name.slice(0,3).downcase)
  end
  
  # process a line pre-determined to be a zone
  def process_zone(line,filename)
    # zone line: GMTOFF RULES FORMAT  [UNTILYEAR [MONTH [DAY [TIME]]]]
    p = line.split

    # hold our structured return object
    # {offset: standard time UTC offset, rule: dstRuleName, format: format, until: when rule ends}
    ret = Hash.new
    # convert gmtoff to the offset in seconds
    ret['offset'] = timeOfDayToSeconds(timeOfDayProcessor(p[0]))
    # rule may be '-'
    if p[1] != "-" then
      # handle the always DST case
      if p[1] =~ /^(\d+):(\d+)$/ then
        ret['dst'] = $1.to_i*3600 + $2.to_i*60
      else
        ret['rule'] = filename+':'+p[1]
      end
    end
    ret['format'] = p[2]
    
    
    # process the until
    if !p[3].nil? && p[3] !~ /^max/ then
      ret['endyear'] = p[3].to_i
    end
    if !p[4].nil? then
      ret['endmonth'] = monthNameProcessor(p[4])
    end
    if !p[5].nil? then
      ret['endday'] = dayRuleProcessor(p[5])
    end
    if !p[6].nil? then
      endtime = timeOfDayProcessor(p[6])
      ret['endhour'] = endtime['hour']
      ret['endminute'] = endtime['minute']
      ret['endsecond'] = endtime['second']
      ret['endtimetype'] = endtime['timetype']
    end
    
    ret['endhour'] = 0 if ret['endhour'].nil?
    ret['endminute'] = 0 if ret['endminute'].nil?
    ret['endsecond'] = 0 if ret['endsecond'].nil?
    ret['endtimetype'] = 'w' if ret['endtimetype'].nil?
    return ret
  end
  
  # process a line pre-determined to be a DST Rule
  # FROM  TO    TYPE  IN   ON       AT    SAVE  LETTER/S
  def process_rule(line)
    p = line.split
    ret = Hash.new
    # from can be min or a number
    ret['from'] = p[0] =~ /^min/i ? 0 : p[0].to_i

    # to can be min/max/only/number
    if p[1] =~ /^\d+$/ then
      ret['to'] = p[1].to_i
    elsif p[1] =~ /^(only|min)/i then
      ret['to'] = ret['from']
    elsif p[1] =~ /^max/i then
      # do not define a max - it is blank
    end
    
    # process isyeartype for all interim years
    if p[2] != '-' then
      ret['type'] = p[2]
    end
    
    # Month
    if !p[3].nil? then ret['month'] = monthNameProcessor(p[3]) end
    
    # day of month
    if !p[4].nil? then ret['day'] = dayRuleProcessor(p[4]) end
    
    # hour
    if !p[5].nil? then 
      tod = timeOfDayProcessor(p[5])
      ret['hour'] = tod['hour']
      ret['minute'] = tod['minute']
      ret['second'] = tod['second']
      ret['timetype'] = tod['timetype']
    end
    
    # amount to save
    if !p[6].nil? then ret['save'] = timeOfDayToSeconds(timeOfDayProcessor(p[6])) end
    
    # letter if not just -
    if !p[7].nil? && p[7] != '-' then ret['letter'] = p[7] end
      
    # make sure important defaults are set
    ret['month'] = 0 if ret['month'].nil?
    ret['hour'] = 0 if ret['hour'].nil?
    ret['minute'] = 0 if ret['minute'].nil?
    ret['second'] = 0 if ret['second'].nil?
    # we cannot set the date, since we do not know what the maximum is, so we will set it to 31
    return ret
  end
  
  # normalize zone information to a series of transitions
  # if there are "max" DST transitions, i.e. no 'to' year in a rule, then we go 30 years in the future
  # zones - zone information
  # rules - DST time change rules
  # leaps - leapsecond additions
  def normalize_zone(name,zones,rules,leaps) 
    # here is our logic:
    # How do we go about doing this? We need to convert from the Zone and DST rules to absolute moments in time
    # We treat the zone entries as the groups, and the DST as the individuals. We can work in chronological order if we
    #    start at the beginning of a zone, get its macro rules (offset, format), then work through any DST rules associated with it
    # 1) Go through each zone entry, create the initial transition points and associated DST rules
    #    Find all the DST rules that fall within that zone entry, get them, and order them chronologically.
    #    Now we have a series of transitions and what happens at them
    # 2) Repeat for the next zone entry
    # 3) Uniqify all the entries (offset,dst,name)

    # this is what the input data looks like
    # Zone: {offset: standard time UTC offset, rule: dstRuleName, format: format, endyear: year, endmonth: month
    #        endday: dayObj, endtime: seconds since midnight that rule ends}    
    # Rule: {from: fromYear, to: toYear, in: month, on: dayObj, at: hour, save: dstDifferential, letter: format}
    # Leap: 
    
    # this is what the output data should look like
    #{
    #  transitions => [[1000,1],[1500,2],[1565,1],[2734,3],...],
    #  types =>[{'o'=>-36500,'n'=>'EDT','d'=>1},{'o'=>-36000,'n'=>'EST','d'=>0},...],
    #  leaps => [[1005,1],[2016,2],[3578,3],...]
    #}
    types = []
    transitions = []
    leapseconds = []
    lastzoneend = nil
    typehash = {}

    # the last type we had - to ensure we avoid transitioning twice to the same offset:isdst:name
    lastType = nil

    # this records our last offsets. It matters when we transition entries within zones and between zones
    # our initial std offset is the first offset we have for the zone
    previous = Hash.new
    previous['dst'] = 0
    previous['std'] = zones.length > 0 ? zones[0]['offset'] : 0
    previous['offset'] = previous['dst']+previous['std']

    # we will go through each entry and create the known types
    zones.each {|entry|
      type = nil
      zoneend = {'year'=>entry['endyear'],'month'=>entry['endmonth'],'day'=>getActualDate(entry['endyear'],entry['endmonth'],entry['endday']),
                 'hour'=>entry['endhour'],'minute'=>entry['endminute'],'second'=>entry['endsecond'],'timetype'=>entry['endtimetype'],
                 'dst'=>previous['dst'],'std'=>previous['std']}
      # if the zone has no end, we put it at Maxyear
      if zoneend['year'].nil? then
        zoneend['year'] = Maxyear 
        zoneend['timetype'] = 'u'
      end
      
      # do we have DST rules for this zone entry?
      if entry['rule'].nil? || entry['rule'] == '-' || rules[entry['rule']].nil? then
        # if there is no DST rule, then we have one simple entry with no DST or fixed DST
        fullOffset = entry['offset'] + (entry['dst'].nil? ? 0 : entry['dst'].to_i)
        type = [fullOffset,entry['dst'].nil? ? 0 : 1,entry['format']]
        typeStr = type.join(':')
        # whatever happens, we need to ensure this type exists
        tindex = typehash[typeStr]
        if tindex.nil? then
          tindex = types.length
          types.push(type)
          typehash[typeStr] = tindex
        end
        
        # we have a transition from the last zone to our zone - if the type (offset:isdst:name) has changed
        if !lastzoneend.nil? && (lastType.nil? || lastType != typeStr) then
          secs = timeToSeconds(lastzoneend)-lastzoneend['offset']
          # we may push or replace, depending on if this one is after the previous or the same time
          if transitions.length > 0 && transitions[transitions.length-1][0] == secs then
            transitions[transitions.length-1] = [secs,tindex]
          else
            transitions.push([secs,tindex])
          end  
          lastType = typeStr
        end
        
        # this zone ends when given, with the offset of during the zone if wall or standard time, or no offset if UTC
        offset = 0
        stdOffset = entry['offset']
        dstOffset = entry['dst'].nil? ? 0 : entry['dst'].to_i
        case entry['endtimetype']
          when 'w'
            offset = stdOffset+dstOffset
          when 's'
            offset = stdOffset
          else
            offset = 0
        end
        # if we had an end of zone record that as the last zone end 
        if !entry['endyear'].nil? then
          lastzoneend = zoneend
          lastzoneend['std'] = stdOffset
          lastzoneend['dst'] = dstOffset
          lastzoneend['offset'] = offset
        end
        # this is the last type we had going forward
        previous['offset'] = offset
        previous['dst'] = dstOffset
        previous['std'] = stdOffset
      else
        # we have some DST rules, so we need multiple entries, at least two, possibly more
        ruleset = rules[entry['rule']]
        dsttx = []
        oldtx = []

        # get all the rules in the set
        tmptx = []
        ruleset.each {
          |rule|
          second = {'year'=>rule['from'],'month'=>rule['month'],'day'=>getActualDate(rule['from'],rule['month'],rule['day']),
                    'hour'=>rule['hour'],'minute'=>rule['minute'],'second'=>rule['second'],'timetype'=>rule['timetype']}

          # OK, so we have determined that our rule does not start after the zone ends
          # now we go through each year in the rule, see if it is not before the end of the zone
          maxyear = rule['to'].nil? ? Maxyear : rule['to']
          for i in rule['from']..maxyear
            # see if the moment in question is before the beginning or past the end
            second['year'] = i
            second['day'] = getActualDate(i,rule['month'],rule['day'])
            # see if this is a special year that needs to meet the rule
            next if !rule['type'].nil? && !yearistype(i,rule['type'])
            # now just add the tx entry - initally, there are no offsets
            tmptx.push({'year'=>i,'month'=>rule['month'],'day'=>second['day'],'hour'=>rule['hour'],
                        'minute'=>rule['minute'],'second'=>rule['second'],'timetype'=>rule['timetype'],
                        'save'=>rule['save'],'letter'=>rule['letter'],'std'=>0,'dst'=>0})
          end
        }

        # tmptx contains all of the transitions within the ruleset, so we can sort them without thinking about timetype
        tmptx.sort! {|x,y| compareMomentsNew(x,y)}
        
        # now we can go through and sort those that are relevant into dsttx (in our zone) and oldtx (previous)
        tmptx.each { |tx|
          tx['std'] = previous['std']
          tx['dst'] = previous['dst']
          if compareMomentsNew(zoneend,tx) < 0 then
            break
          elsif !lastzoneend.nil? && compareMomentsNew(lastzoneend,tx) > 0 then
            oldtx.push(tx)
          else
            dsttx.push(tx)          
          end
        }

        # mark the transition from the last zone entry to ours before adding internal DST for ours
        # we only add if the type info (name,offset,isdst) has changed and the first DST is not exactly at the moment of start of zone
        if !lastzoneend.nil? && (dsttx.length == 0 || compareMomentsNew(lastzoneend,dsttx[0]) != 0) then
          # we need to create a type that has the characteristics of this zone, but with the letter of the ruleset 
          # we do one of three things:
          #   if new rule is explicitly in DST when we transition, we take the letter given for that DST
          #   if new rule is explicitly in STD when we transition, we take the letter given for that STD
          #   if new rule is not explicitly in either, we take the letter for the earliest given STD
          dst = {'letter'=>nil,'isdst'=>0,'offset'=>0}
          if oldtx.length > 0 then
            tx = oldtx[oldtx.length-1]
            dst['letter'] = tx['letter']
            dst['isdst'] = tx['save'] == 0 ? 0 : 1
            dst['offset'] = tx['save']
          else
            dsttx.each {|tx|
              if tx['save'] == 0 then
                dst['letter'] = tx['letter']
                dst['isdst'] = 0
                dst['offset'] = 0
                break
              end
            }
          end

          # which letter do we use?
          myname = entry['format'].sub('%s',dst['letter'].nil? ? '' : dst['letter'])
          # look for STD/DST format
          if myname =~ /^(.+)\/(.+)$/ then
            myname = dst['isdst']==0 ? $1 : $2
          end
          type = [entry['offset']+dst['offset'],dst['isdst'],myname]
          typeStr = type.join(':')
          # whatever happens, we need to ensure this type exists
          tindex = typehash[typeStr]
          if tindex.nil? then
            tindex = types.length
            types.push(type)
            typehash[typeStr] = tindex
          end
          # is the entry different?
          if lastType.nil? || lastType != typeStr then
            secs = timeToSeconds(lastzoneend)-lastzoneend['offset']
            # we may push or replace, depending on if this one is after the previous or the same time
            if transitions.length > 0 && transitions[transitions.length-1][0] == secs then
              transitions[transitions.length-1] = [secs,tindex]
            else
              transitions.push([secs,tindex])
            end  
            lastType = typeStr
            previous['offset'] = entry['offset']+dst['offset']
            previous['dst'] = dst['offset']
            previous['std'] = entry['offset']
          end
        end

        # next create the transition entries
        dsttx.each {
          |tx|
          myname = entry['format'].sub('%s',tx['letter'].nil? ? '' : tx['letter'])
          # look for STD/DST format
          if myname =~ /^(.+)\/(.+)$/ then
            myname = tx['save']==0 ? $1 : $2
          end
          type = [entry['offset']+tx['save'], tx['save']==0?0:1, myname]
          typeStr = type.join(':')
          # whatever happens, we need to ensure this type exists
          tindex = typehash[typeStr]
          if tindex.nil? then
            tindex = types.length
            types.push(type)
            typehash[typeStr] = tindex
          end
          if lastType.nil? || lastType != typeStr then
            offset = 0
            case tx['timetype']
              when 'w'
                offset = previous['offset']
              when 's'
                offset = previous['std']
              when 'u'
                offset = 0
            end
            txtime = timeToSeconds(tx)-offset
            # we may push or replace, depending on if this one is after the previous or the same time
            if transitions.length > 0 && transitions[transitions.length-1][0] == txtime then
              transitions[transitions.length-1] = [txtime,tindex]
            else
              transitions.push([txtime,tindex])
            end
            # now mark our type as the lastType for the next one
            lastType = typeStr
            # our offsets - DST and standard and full - are the previous ones for the next attempt
            previous['dst'] = tx['save']
            previous['offset'] = entry['offset']+tx['save']
            previous['std'] = entry['offset']
          end
        }
        
        # this zone ends at the end year - however, if the last DST transition is the same as the end of the zone, we only keep one
        if !entry['endyear'].nil? then
          lastzoneend = zoneend

          len = transitions.length
          if len > 1 && transitions[len-1][0] == (timeToSeconds(zoneend)-types[transitions[len-2][1]][0]) then
            transitions.pop 
            oldType = types[transitions[transitions.length-1][1]]
            previous['offset'] = oldType[0]
            previous['dst'] = oldType[1]
            lastType = oldType.join(':')
            lastzoneend['std'] = entry['offset']
            lastzoneend['dst'] = oldType[0]-entry['offset']
            lastzoneend['offset'] = oldType[0]
          else
            # - UTC: offset is 0
            # - standard time: offset is the offset from the zone
            # - wall time: offset is the offset from the zone plus the last DST offset in the zone
            offset = 0
            stdOffset = entry['offset']
            lastOffset = types[transitions[len-1][1]][0]
            dstOffset = lastOffset-stdOffset
            case entry['endtimetype']
              when 'w'
                offset = lastOffset
              when 's'
                offset = stdOffset
              when 'u'
                offset = 0
            end
            previous['offset'] = offset
            lastzoneend['std'] = stdOffset
            lastzoneend['dst'] = dstOffset
            lastzoneend['offset'] = offset
          end
        end
      end
    }
    
    # now we need to process the leapsecond entries. They are as follows:
    #{'year' => y, 'month' => m, 'day' => d, 'time' => seconds, 'add' => 1/-1, 'UTC' => true/false}
    # UTC determines if the time given is UTC (true) or local (false)
    
    # keep track of all the leapseconds so far
    totalLeaps = 0
    leaps.each {|entry|
      # get the seconds for the day
      secs = GregorianCalendar.calendarToSeconds(entry['year'],entry['month'],entry['day'],entry['hour'],entry['minute'],entry['second'])
      
      # add our add/subtract to the total
      totalLeaps += entry['add']
      
      # is the time is given as UTC, we are good; if not, we need to convert
      if !entry['UTC'] && types.length > 0 then
        # how do we convert? we run through all transitions from beginning until ours, keeping track of the last offset
        # with each one, we add the offset to our time, to see if the transition is after us. If so, we change our time
        # to the last offset given and we are done
        offset = types[0]['o']
        transitions.each{ |tx|
          txtime = tx[0]
          txtype = types[tx[1]]
          if txtime > secs-offset then
            break
          end
          offset = txtype['o']
        }
        secs -= offset
      end
      
      # record it
      leapseconds.push([secs,totalLeaps])
    }
    
    return {'transitions'=>transitions, 'types'=>types, 'leaps'=>leapseconds}
  end


  def zeropad(arg)
    # make sure it is a string
    arg = arg.to_s
    arg = '0'+arg if arg.length < 2
    return arg
  end

  def format(secs)
    cal = GregorianCalendar.new(secs)
    return cal.year.to_s+'.'+zeropad(cal.month+1)+'.'+zeropad(cal.day+1)+'_'+zeropad(cal.hour)+':'+zeropad(cal.minute)
  end
  
  # compare two moments
  def compareMoments(first,second,lastOffset,dstOffset)
    # we may be comparing two different types and need to handle it
    status = 0
    a = timeToSeconds(first)
    b = timeToSeconds(second)
    
    if first['timetype'] != second['timetype'] then
      a -= (lastOffset-dstOffset) if first['timetype'] == 's'
      b -= (lastOffset-dstOffset) if second['timetype'] == 's'
      a -= lastOffset if first['timetype'] == 'w'
      b -= lastOffset if second['timetype'] == 'w'
    end
    return a<=>b
  end
  
    # compare two moments
    def compareMomentsNew(first,second)
      # we may be comparing two different types and need to handle it
      status = 0
      a = timeToSeconds(first)
      b = timeToSeconds(second)

      if first['timetype'] != second['timetype'] then
        a -= first['std'] if first['timetype'] == 's'
        b -= second['std'] if second['timetype'] == 's'
        a -= (first['std']+first['dst']) if first['timetype'] == 'w'
        b -= (second['std']+second['dst']) if second['timetype'] == 'w'
      end
      return a<=>b
    end

  # convert time in a particular zone to seconds offset from Unix Epoch
  def timeToSeconds(obj)
    # convert to RD days - must account for empty elements - in our case they are the last
    year = obj['year'].nil? ? 0 : obj['year']
    month = obj['month'].nil? ? 0 : obj['month']
    day = obj['day'].nil? ? 0 : obj['day']
    hour = obj['hour'].nil? ? 0 : obj['hour']
    minute = obj['minute'].nil? ? 0 : obj['minute']
    second = obj['second'].nil? ? 0 : obj['second']
    return GregorianCalendar.calendarToSeconds(year,month,day,hour,minute,second)
  end
  
  # process the options for a day of the month into an object {date, dow, incidence}
  def dayRuleProcessor(rule)
    # three possibilities: a straight number, dayofweek[comparator]number, [last|first]dayofweek
    if rule =~ /^\d+$/ then
      obj = {'date' => rule.to_i-1, 'dow' => -1, 'incidence' => 0}
    elsif rule =~ /^(\w+)([><][=]?)(\d+)$/ then
      obj = {'date' => $3.to_i-1, 'dow' => weekNameProcessor($1), 'incidence' => $2 =~ /^>/ ? 1 : -1}
    elsif rule =~ /^(last|first)(\w+)$/ then
      obj = {'date' => nil, 'dow' => weekNameProcessor($2), 'incidence' => $1 == 'first' ? 1 : -1}
    else
      obj = nil
    end
    
    return obj
  end
  
  # convert time to seconds
  def timeOfDayToSeconds(time)
    endtime = 0
    endtime += time['hour']*60*60
    if !time['minute'].nil? then
      endtime += time['minute']*60
    end

    if !time['second'].nil? then
      endtime += time['second']
    end
    
    if !time['sign'].nil? then
      endtime *= time['sign']
    end
    return endtime
  end
  
  # convert time to seconds
  def timeOfDayProcessor(time)
    ret = Hash.new
    time =~ /^\s*(-)?(\d+)(:(\d+)(:(\d+))?)?([wsugz])?\s*$/
    ret['hour'] = $2.to_i
    if !$4.nil? then
      ret['minute'] = $4.to_i
    end

    if !$6.nil? then
      ret['second'] = $6.to_i
    end
    
    ret['sign'] = $1.nil? ? 1 : -1
    case $7
      when 'w', nil
        # wall time
        timetype = 'w'
      when 's'
        # standard time
        timetype = 's'
      when 'u','g','z'
        # UTC
        timetype = 'u'
    end
    ret['timetype'] = timetype
    return ret
  end
  
  # get an actual date in a month, given the year, month and rule for determining
  def getActualDate(year,month,dayrule)
    dayrule = dayrule.nil? ? {} : dayrule
    return GregorianCalendar.getActualDate(year,month,dayrule['date'],dayrule['dow'],dayrule['incidence'])
  end
  
  # yearistype processor
  def yearistype(year,type)
    # first, does the year tell us if it is wild, meaning no match of anything?
    # any nil year, starts with 0 or has a non-number in it
    istype = false
    
    if year.nil? || year =~ /^(0|.*[^0-9].*)/ then
      istype = false
    else
      case type
        when "even"
          istype  = year.to_i%2 == 0
        when /non(us)?pres/
          istype = year.to_i%4 == 0
        when "odd"
          istype  = year.to_i%2 != 0
        when "uspres"
          istype = year.to_i%4 != 0
        else
          istype = false
      end
    end
    
    # return our result
    return istype
  end  
  
  def decomment(line)
    # find the first # and strip everything after it
    com = line.index('#')
    return com.nil? ? line : line.slice(0,com)
  end
end

if ARGV.length < 2 then
  puts $0 + " tz_parent_directory output_directory [files to process]"
else
  toprocess = ARGV.length < 3 ? toprocess = $TDATA : toprocess = ARGV[2..ARGV.length]
  ZoneInfoCompiler.new.main(ARGV[0],ARGV[1],toprocess)
end
exit


