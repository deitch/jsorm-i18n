
class GregorianCalendar
  SecMinute = 60
  SecHour = 60*60
  SecDay = 24*60*60
  EPOCH_DAYS = 719163
  DAYS_IN_400_YEARS = 146097
  DAYS_IN_100_YEARS = 36524
  DAYS_IN_4_YEARS = 1461
  DAYS_IN_1_YEAR = 365
  
  attr_reader :time, :year, :month, :day, :hour, :minute, :second
  
  def initialize(time)
    time = time.nil? ? Time.now().to_i : time
    setTime(time)
  end
  
  # set a new time - seconds from Unix Epoch
  def time=(time)
    setTime(time)
  end
  def setTime(time)
    @time = time
    mtime = GregorianCalendar.secsToCalendar(time)
    @year = mtime['year']
    @month = mtime['month']
    @day = mtime['day']
    @hour = mtime['hour']
    @minute = mtime['minute']
    @second = mtime['second']
  end
  def setDate(year,month,day,hour,minute,second)
    @year = year
    @month = month
    @day = day
    @hour = hour
    @minute = minute
    @second = second
    @time = GregorianCalendar.calendarToSecs(year,month,day,hour,minute,second)
  end
  
  # is a year a leap year?
  def GregorianCalendar.isLeapYear(year)
  	m = year%4
  	return (year%4 == 0) && (m != 100) && (m != 200) && (m!= 300)
  end

  # convert days since epoch to calendar date in UTC
  def GregorianCalendar.daysToCalendar(date)
  	# calculate the y/m/d
  	# RD of the Gregorian Epoch (0001.01.01)
  	epoch = 1
  	# first calculate the year
  	# days between our date and RD1
  	rDays = date - epoch
  	# how many whole 400 year units are there?
  	n400 = (rDays/DAYS_IN_400_YEARS).floor
  	# how many days left that are less than 400
  	d400 = rDays % DAYS_IN_400_YEARS
  	# how many 100 year units are there left?
  	n100 = (d400/DAYS_IN_100_YEARS).floor
  	# how many days left that are less than 100?
  	d100 = d400 % DAYS_IN_100_YEARS
  	# how many 4 year units?
  	n4 = (d100/DAYS_IN_4_YEARS).floor
  	# how many days left that are less than 4?
  	d4 = d100 % DAYS_IN_4_YEARS
  	# how many single year units are left?
  	n1 = (d4/DAYS_IN_1_YEAR).floor
  	# are we at the last day of a leap year?
  	lastDayLeap = n100==4 || n1 == 4
  	year = 400*n400 + 100*n100 + 4*n4 + n1 + (lastDayLeap ? 0 : 1);
  	leap = GregorianCalendar.isLeapYear(year)
	
  	# how many individual days are left?
  	d1 = lastDayLeap  ? DAYS_IN_1_YEAR : d4 % DAYS_IN_1_YEAR

  	# next calculate the month
  	priorDays = d1
  	leapCorrectionDays = 0
  	# we need to know the date for year.03.01 (March 1)
  	march1 = 31 + 28 + (leap ? 1 : 0)
  	if priorDays < march1 then
  		leapCorrectionDays = 0
  	elsif priorDays >= march1 && leap then
  		leapCorrectionDays = 1
  	else
  		leapCorrectionDays = 2
  	end
  	month = ((12*(priorDays+leapCorrectionDays)+373) / 367).floor-1
	
  	# calculate the days
  	#
  	# Convert the months to days from 1st January in a given year
  	#
  	# day of the month = day of year - days in all previous months - 1 (because of 0 to max-1)
  	day = d1 - ((367*(month+1)-362)/12).floor+leapCorrectionDays;
    
  	return {'year'=> year, 'month'=> month, 'day'=> day}
  end

  # convert seconds since epoch to calendar date and time in UTC
  def GregorianCalendar.secsToCalendar(secs)
    remain = secs.modulo(SecDay)
    wholeDays = secs/SecDay + EPOCH_DAYS
    cal = GregorianCalendar.daysToCalendar(wholeDays)
    # now translate to a time of day
    hour = remain/SecHour
    remain = remain.modulo(SecHour)
    minute = remain/SecMinute
    second = remain.modulo(SecMinute)
    cal['hour'] = hour
    cal['minute'] = minute
    cal['second'] = second
    return cal
  end

  # convert absolute calendar to RD days
  def GregorianCalendar.calendarToDays(year,month,day)
		epoch = 1
		yearDays = 365*(year-1)
		leapDays = ((year-1)/4).floor - ((year-1)/100).floor + ((year-1)/400).floor
		monthDays = ((367*(month+1)-362)/12).floor
		leapCorrectionDays = 0
		if month < 2 then
			leapCorrectionDays = 0;
		elsif GregorianCalendar.isLeapYear(year) then
			leapCorrectionDays = -1;
		else 
			leapCorrectionDays = -2;
		end
		# get the days since RD
		return epoch - 1 + yearDays + leapDays + monthDays + leapCorrectionDays + day + 1
  end
  
  # convert time in a particular zone to seconds offset from Unix Epoch
  def GregorianCalendar.calendarToSeconds(year,month,day,hour,minute,secs)
    # convert to RD days - must account for empty elements
    month = month.nil? ? 0 : month
    day = day.nil? ? 0 : day
    secs = secs.nil? ? 0 : secs
    hour = hour.nil? ? 0 : hour
    minute = minute.nil? ? 0 : minute
    days = GregorianCalendar.calendarToDays(year,month,day)
		# correct for the Unix Epoch, not RD Epoch
		days -= EPOCH_DAYS
		secs = secs.nil? ? 0 : secs
    # convert to seconds, add our seconds and our offset
    return days*SecDay+hour*SecHour+minute*SecMinute+secs
  end
  
  # get an actual date in a month, given the year, month and rule for determining
  def GregorianCalendar.getActualDate(year,month,dayOfMonth,dayOfWeek,incidence)
    date = nil

    # we have two possibilities: a fixed date (fixed from beginning or end of month), and a relative day of week
    if dayOfMonth.nil? then
      offsetdate = nil
    elsif dayOfMonth >= 0 then
      # dayOfMonth is non-nil, so we just use the actual one, which may be negative, indicating from end of month
      offsetdate = dayOfMonth
    else
      offsetdate =  GregorianCalendar.getLastDayOfMonth(year,month) + dayOfMonth
    end
    
    # no day of week means the offset date
    if dayOfWeek.nil? || dayOfWeek<0 || incidence.nil? then
      date = offsetdate.nil? ? 0 : offsetdate
    else
      # no incidence means the first
      if incidence.nil? then
        incidence = 1
      end
      # calculate the date based on the incidence and dayOfWeek
      # is it positive or negative?
      if incidence>0 then
        offsetdate = 0 if offsetdate.nil?
        # first find the day of week of the date requested
        dow1 = GregorianCalendar.getDowFromDate(year,month,offsetdate)
        # get offset from the dow1
        # we are incidence-1 whole weeks, plus the offset to the first such case (which needs to be mod7)
        offset = (incidence-1)*7+(dayOfWeek-dow1+7)%7
      else
        # if the offset date is zero, then negative incidence is the end of the month
        offsetdate = GregorianCalendar.getLastDayOfMonth(year,month) if offsetdate.nil?
        dow1 = GregorianCalendar.getDowFromDate(year,month,offsetdate)
        offset = (incidence+1)*7-(dow1-dayOfWeek+7)%7
      end        
      date = offset+offsetdate
    end

    return date
  end
  
  # get the last day of the month - assumes month is 0-11
  def GregorianCalendar.getLastDayOfMonth(year,month)
    leap = GregorianCalendar.isLeapYear(year) ? 1 : 0
    odd = month%2
    feb = month == 1 ? 1 : 0
    crossover = (month/7).floor
    # make sure we return 0-27/28/29/30 rather than 0-28/29/30/31
    return 31-odd+2*crossover*odd-1*crossover-feb*(2-leap) - 1
  end
  
  # get DOW from a date
  def GregorianCalendar.getDowFromDate(year,month,date)
    return(GregorianCalendar.getDowFromRD(GregorianCalendar.getRDFromDate(year,month,date)))
  end
  
  # get RD from a Gregorian date
  def GregorianCalendar.getRDFromDate(year,month,date)
    # note: these formulae assume month 1-12 and date 1-28/29/30/31
    month+=1
    date+=1
    correction = 0
    if month<=2 then
      correction = 0
    elsif month>2 && GregorianCalendar.isLeapYear(year) then
      correction = -1
    else
      correction = -2
    end
    return 1-1+365*(year-1)+((year-1)/4).floor-((year-1)/100).floor+((year-1)/400).floor+((367*month-362)/12).floor+correction+date
  end
  
  # get day of week from an RD
  def GregorianCalendar.getDowFromRD(rd)
    # RD0 was a Monday=1, so this is real easy
    return rd%7
  end
  
  # compare two dates max determines if nil should be treated as the highest possible value
  def GregorianCalendar.compareMoments(first,second,max)
    max = false if max.nil?
    status = 0
    # start with the objects
    a = first
    b = second
    if a.nil? then
      if b.nil? then
        return 0
      elsif max then
        return 1
      else
        return -1
      end
    elsif b.nil? then
      return (max ? -1 : 1)
    end
    
    # next the years
    a = first['year']
    b = second['year']
    if a.nil? then
      if b.nil? then
        status = 0
      else
        status =  max ? 1 : -1
      end
    elsif b.nil? then
      status = max ? -1 : 1
    else
      status = a <=> b
    end
    
    # years the same, then do the months
    if status == 0 then
      a = first['month']
      b = second['month']
      if a.nil? then
        a = max ? 11 : 0
      end
      if b.nil? then
        b = max ? 11 : 0
      end
      status = a <=> b
    end
    # months also the same, then do the days
    if status == 0 then
      a = first['day']
      b = second['day']
      if a.nil? then
        a = max ? GregorianCalendar.getLastDayOfMonth(first['year'],first['month']) : 0
      end
      if b.nil? then
        b = max ? GregorianCalendar.getLastDayOfMonth(second['year'],second['month']) : 0
      end
      status = a <=> b
    end
    # days the same? compare hour in the day
    if status == 0 then
      a = first['hour']
      b = second['hour']
      if a.nil? then
        a = max ? 23 : 0
      end
      if b.nil? then
        b = max ? 23 : 0
      end
      status = a <=> b
    end
    # hours the same? compare minutes in the hour
    if status == 0 then
      a = first['minute']
      b = second['minute']
      if a.nil? then
        a = max ? 59 : 0
      end
      if b.nil? then
        b = max ? 59 : 0
      end
      status = a <=> b
    end
    # minutes the same? compare seconds in the minute
    if status == 0 then
      a = first['second']
      b = second['second']
      if a.nil? then
        a = max ? 59 : 0
      end
      if b.nil? then
        b = max ? 59 : 0
      end
      status = a <=> b
    end
    
    return status
  end
end

