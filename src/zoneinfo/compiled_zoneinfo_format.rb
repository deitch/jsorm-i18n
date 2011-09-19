
# original rules  
  [
    {"month"=>4, "time"=>7200000, "from"=>1921, "to"=>1921, "letter"=>"D", "day"=>{"dow"=>0, "date"=>1, "incidence"=>0}, "save"=>3600000}, 
    {"month"=>8, "time"=>7200000, "from"=>1921, "to"=>1921, "letter"=>"S", "day"=>{"dow"=>0, "date"=>1, "incidence"=>0}, "save"=>0}, 
    {"month"=>3, "time"=>7200000, "from"=>1941, "to"=>1961, "letter"=>"D", "day"=>{"dow"=>0, "date"=>0, "incidence"=>-1}, "save"=>3600000}, 
    {"month"=>8, "time"=>7200000, "from"=>1941, "to"=>1941, "letter"=>"S", "day"=>{"dow"=>0, "date"=>0, "incidence"=>-1}, "save"=>0}, 
    {"month"=>5, "time"=>7200000, "from"=>1946, "to"=>1946, "letter"=>"S", "day"=>{"dow"=>0, "date"=>2, "incidence"=>0}, "save"=>0}, 
    {"month"=>8, "time"=>7200000, "from"=>1950, "to"=>1955, "letter"=>"S", "day"=>{"dow"=>0, "date"=>0, "incidence"=>-1}, "save"=>0}, 
    {"month"=>9, "time"=>7200000, "from"=>1956, "to"=>1960, "letter"=>"S", "day"=>{"dow"=>0, "date"=>0, "incidence"=>-1}, "save"=>0}
  ]

=begin
if we do non-normalized: I have a year: find the most recent change in time, and use it - 
* REMEMBER, WE KEEP LAST CHANGE, NOT JUST LAST ONE IN OUR YEAR
* Example, 1945:
* 1) Check all the from/to and find those that the range includes our year
* 2) Within those in range, calculate the day of our year for each one
* 3) Find the one that is the maximum, but still <= day of year; that is our change; return
* 4) If none is found, reduce the search year by one, repeat from 1
=end

=begin
* We have one more alternative, the one used by zic: 
* Do everything as seconds since the epoch. In that case, the file is just a list of transition times.
* transitions: [1000,1500,1565,2734,...]
* 
* We also need information about each transition: specifically, the offset from GMT, the name indicator, and the DST value (true/false)
* Thus, we would have something like:
* {1000=>1,1500=>2,1565=>1,2734=>3,...}
* each key is a time for transition; each value is an index into a separate array
* [{'o'=>-36500,'n'=>'EDT','d'=>1},...]
* This is slightly longer to transmit, but a lot cleaner to process. The client need only look for the last transition time. Period.
* We would also need a default time, if the checking time is earlier than the first. In that case, use the first one in 'types'
* Leaps is the list of times to apply leapseconds. At 1005 seconds from the epoch, apply 1 leapsecond; at 2016, apply another, total of 2; etc.
=end  
{
  transitions => {1000=>1,1500=>2,1565=>1,2734=>3,...},
  types =>[{'o'=>-36500,'n'=>'EDT','d'=>1},{'o'=>-36000,'n'=>'EST','d'=>0},...],
  leaps => [1005=>1,2016=>2,3578=>3,...]
}
=begin
* How do we go about doing this? We need to convert from the Zone and DST rules to absolute moments in time
* We treat the zone entries as the groups, and the DST as the individuals. We can work in chronological order if we
*    start at the beginning of a zone, get its macro rules (offset, format), then work through any DST rules associated with it
* 1) Go through each zone entry, create the initial transition points and associated DST rules
*    Find all the DST rules that fall within that zone entry, get them, and order them chronologically.
*    Now we have a series of transitions and what happens at them
* 2) Repeat for the next zone entry
* 3) Uniqify all the entries (offset,dst,name)
=end



=begin
* what is the size impact? 
* Average and std dev of file size using rules
* Average and std dev of file size using transitions
=end

