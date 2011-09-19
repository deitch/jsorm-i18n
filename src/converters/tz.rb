#!/usr/bin/env ruby
#

class TableConverter
  def initialize
    super()
  end
  
  def main(fileName)
    file = File.new(fileName)
    list = []
    q = '\''
    while line = file.gets
      if line !~ /^\s*#/
        p = line.split
        list.push(q+p[2]+q + ' : '+q+'-0500'+q+',')
      end
    end
    puts list
  end
  
end

if ARGV.length < 1 then
  puts $0 + " source_file_name"
else
  TableConverter.new.main ARGV[0]
end
exit


