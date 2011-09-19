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
      # is this a header or one we really process?
      count = 0
      value = {}
      section.elements.each do |element| 
        process_item(element,value,count)
        count += 1
      end
      # now we need to construct our line
      q = '\''
      ary = []
      ary.push('name : ' + q+(value['name'] ? value['name'] : '')+q)
      ary.push('format : \'\'')
      myline = value['code'] + ' : ' + '{'+ary.join(', ')+'},'
      list.push(myline)
    end
  end

  # get the items we care about - currency[0] (after ,), country[0] (before ,), iso code[1], unicode sign[7]
  # store them as - currency[4], country[5], iso code[key], unicode[1]
  def process_item(element,value,count)
    # get all the card information in a useful format for Ruby
    case count 
    when 0
      value['name'] = element.text ? element.text.strip : ''
    when 1
      value['code'] = element.text ? element.text.strip : ''
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


