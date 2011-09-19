#!/usr/bin/env ruby
#
require 'rexml/document'
include REXML

class TableConverter
  def initialize
    super()
  end
  
  def main(fileName)
    file = File.new(fileName)
    list = []
    doc = Document.new(file)
    process_section(doc.root,list)
    puts list
  end
  
  # process each line
  def process_section(section,list)
    name = section.name.downcase
    if name == 'table' then
      section.elements.each {|element| process_section(element,list)}
    elsif name == 'tr' then
      count = 0
      value = {}
      section.elements.each do |element| 
        process_item(element,value,count)
        count += 1
      end
      # now we need to construct our line
      q = '\''
      ary = []
      ary.push('dec : '+q+'.'+q)
      ary.push('symbol : ' + q+(value['unicode'] ? value['unicode'] : '')+q)
      ary.push('group : '+q+','+q)
      ary.push('after : false')
      ary.push('currency : '+q+(value['currency'] ? value['currency'] : '') +q)
      ary.push('country : '+q+(value['country'] ? value['country'] : '') +q)
      myline = value['iso'] + ' : ' + '{'+ary.join(', ')+'},'
      list.push(myline)
    end
  end

  # get the items we care about - currency[0] (after ,), country[0] (before ,), iso code[1], unicode sign[7]
  # store them as - currency[4], country[5], iso code[key], unicode[1]
  def process_item(element,value,count)
    # get all the card information in a useful format for Ruby
    case count 
    when 0
      p = element.text.split(',',2)
      value['currency'] = p[1] ? p[1].strip : ''
      value['country'] = p[0] ? p[0].strip : ''
    when 1
      value['iso'] = element.text
    when 7
      unicode = element.text
      # first check for multiple unicode
      value['unicode'] = ''
      p = unicode.split(/[,\s]+/)
      p.each do |p|
        value['unicode'] += '\u'+p.rjust(4).tr(' ','0')
      end
    else
      return
    end
  end
  
end

if ARGV.length < 1 then
  puts $0 + " source_file_name"
else
  TableConverter.new.main ARGV[0]
end
exit


