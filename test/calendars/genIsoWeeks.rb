#!/usr/bin/env ruby

require 'date'
require 'rubygems'
require 'json'

dates = []
minYear=1940
maxYear=2050
for i in 0..10
  year = rand(maxYear-minYear)+minYear
  months = []
  for j in 0..3
    month = rand(12)
    maxDate = 30
    case month
      when 0,2,4,6,7,9,11
        maxDate = 30
      when 1
        maxDate = 27
      else
        maxDate = 29
    end
    for i in 0..3
      dates.push([year,month+1,rand(maxDate)+1])
    end
  end
end

dates.sort! {|x,y|
  status = x[0]<=>y[0]
  status = x[1]<=>y[1] if status == 0
  status = x[2]<=>y[2] if status == 0
  status
}
finaldates = []
dates.each {|date|
  d = Date.new(date[0],date[1],date[2])
  finaldates.push([date[0],date[1],date[2],d.yday,d.wday,d.cweek,d.cwyear])
}
puts '['+"\n"
finaldates.each{|d| puts "\t"+d.to_json+",\n"}
puts ']'+"\n"