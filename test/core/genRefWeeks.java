import java.util.TimeZone;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Calendar;
import java.util.Arrays;
import java.text.DateFormat;
import java.text.SimpleDateFormat;


public class genRefWeeks {
	private static int[][] dates = {
	  {-214193,-586,7,24,0},
		{-61387,-168,12,5,3},
		{25469,70,9,24,3},
		{49217,135,10,2,0},
		{171307,470,1,8,3},
		{210155,576,5,20,1},
		{253427,694,11,10,6},
		{369740,1013,4,25,0},
		{400085,1096,5,24,0},
		{434355,1190,3,23,5},
		{452605,1240,3,10,6},
		{470160,1288,4,2,5},
		{473837,1298,4,27,0},
		{507850,1391,6,12,0},
		{524156,1436,2,3,3},
		{544676,1492,4,9,6},
		{567118,1553,9,19,6},
		{569477,1560,3,5,6},
		{601716,1648,6,10,3},
		{613424,1680,6,30,0},
		{626596,1716,7,24,5},
		{645554,1768,6,19,0},
		{664224,1819,8,2,1},
		{671401,1839,3,27,3},
		{694799,1903,4,19,0},
		{704424,1929,8,25,0},
		{708842,1941,9,29,1},
		{709409,1943,4,19,1},
		{709580,1943,10,7,4},
		{727274,1992,3,17,2},
		{728714,1996,2,25,0},
		{744313,2038,11,10,3},
		{764652,2094,7,18,0}
		};
	private static int[][] finalDates = new int[dates.length*7*7][];
	public static void main(String[] argc) throws Exception{
		Date minDate = new Date(Long.MIN_VALUE);
		Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
		((GregorianCalendar)cal).setGregorianChange(minDate);

		for (int i=0;i<dates.length;i++) {
			// j represents min days in first week
			for (int j=0; j<7; j++) {
				// k represents first day of week
				for (int k=0; k<7; k++) {
					cal.clear();
					cal.setMinimalDaysInFirstWeek(j+1);
					// Java sets first day of week as 1-7, jsorm use 0-6
					cal.setFirstDayOfWeek(k+1);
					int[] e = dates[i];
					// get a calendar for gmt
					// set the y/m/d
					cal.set(Calendar.YEAR,e[1]);
					cal.set(Calendar.MONTH,e[2]-1);
					cal.set(Calendar.DATE,e[3]);
					int[] tmp = new int[9];
					System.arraycopy(e,0,tmp,0,4);
					tmp[4] = j+1;
					tmp [5] = k;
					tmp[6] = cal.get(Calendar.DAY_OF_YEAR);
					tmp[7] = cal.get(Calendar.WEEK_OF_MONTH);
					tmp[8] = cal.get(Calendar.WEEK_OF_YEAR);
					finalDates[i*49+j*7+k] = tmp;					
				}
				
			}
		}
		System.out.println("// [RD , Year , Month , Date ,  MinDaysInWeek , FirstDayOfWeek , DayOfYear , WeekOfMonth , WeekOfYear]");
		System.out.println("[");
		for (int i=0;i<finalDates.length;i++) {
			System.out.println(Arrays.toString(finalDates[i])+",");
		}
		System.out.println("]");
	}
}