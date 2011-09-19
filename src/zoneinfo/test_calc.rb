#!/usr/bin/env ruby 

require 'gregorian-calendar'

# test calculations of various times

def zeropad(arg)
  # make sure it is a string
  arg = arg.to_s
  arg = '0'+arg if arg.length < 2
  return arg
end

# generate test times
testtimes = []
for year in 1960..1961
  for month in 1..12
    for day in 1..31
      testtimes.push(Time.gm(year,month,day,1,0,0).to_i)
    end
  end
end

puts "Only errors listed\n\n"
puts "COMPARE SYSTEM TO CALCULATED SECONDS TO CALENDAR"
puts "System\t\tCalculated\n"
good = []
bad = []
testtimes.each {|tt|
  stime = Time.at(tt).utc.strftime("%Y.%m.%d_%H:%M")
  cal = GregorianCalendar.new(tt)
  mtimes = cal.year.to_s + '.' + zeropad(cal.month+1)+'.'+zeropad(cal.day+1)+'_'+zeropad(cal.hour)+':'+zeropad(cal.minute)
  output = stime + " " + mtimes
  if mtimes == stime then
    good.push(output)
  else
    bad.push(output)
  end
}
bad.each {|output| puts output + "\n"}

puts "\n"
puts "COMPARE SECSTOCALENDAR TO CALENDARTOSECS"
puts "TrueTime\tCalculated\n"
good = []
bad = []
testtimes.each {|tt|
  stoc = GregorianCalendar.secsToCalendar(tt)
  ctos = GregorianCalendar.calendarToSeconds(stoc['year'],stoc['month'],stoc['day'],stoc['hour'],stoc['minute'],stoc['second'])
  output = tt.to_s + "\t" + ctos.to_s + "\t"+(ctos-tt).to_s
  if ctos == tt then
    good.push(output)
  else
    bad.push(output)
  end
}
bad.each{|output| puts output + "\n"}

puts "\n"
puts "TEST ACTUAL DATE FROM DAY OF WEEK"
puts "Entered\t\t\tExpected\tCalculated\n"
good = []
bad = []
# testcases - each is year,month,dayOfMonth,dayOfWeek,incidence
# real answers can be gotten from www.timeanddate.com/calendar/
testcases = [
              [1997,11,nil,0,1,6],
              [1965,2,2,0,1,6],
              [2007,0,nil,2,-1,29],
              [1986,5,3,0,1,7],
              [1986,5,nil,0,1,0],
              [1986,5,nil,0,2,7],
              [1986,5,nil,0,-1,28],
              [1986,5,nil,0,-2,21]
            ]
testcases.each {|tt|
  year = tt[0]
  month = tt[1]
  day = tt[2]
  dow = tt[3]
  inc = tt[4]
  expected = tt[5]
  calc = GregorianCalendar.getActualDate(year,month,day,dow,inc)
  output = tt.join(',') + "\t\t" + expected.to_s+"\t\t"+calc.to_s
  if expected == calc then
    good.push(output)
  else
    bad.push(output)
  end
}
good.each{|output| puts output + "\n"}