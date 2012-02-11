/**
 * Create a new currency object. 
 * 
 * @class A currency-formatting library. Each object represents a currency. It is responsible for converting an absolute amount, e.g. 67.85, 
 * into a formatted string that is appropriate for the given currency. One first creates a currency object by passing it the 
 * international standard three-letter abbreviation. One can then use that object to format any amount of funds.
 * <p/>
 * Example usage is as follows:
 * <ol>
 * <li>Create a new currency object as <code>var cur = JSORM.currency('USD');</code></li>
 * <li>Format an amount as <code>var f = cur.format(22.57); // returns a string with value $22.57</code></li>
 * <li>Get information about the currency abbreviation (e.g. USD), name (e.g. Dollars), and country (e.g. United States of America)
 *   using <code>cur.getAbbreviation(); cur.getName(); cur.getCountry();</code></li>
 * </ol>
 * 
 * @param {string} abbr The three-letter ISO standard abbreviation for a currency. If the given standard is not found, the defaultCurrency
 *   will be used.
 * @constructor
 */
/*global exports,utils,JSORM */
var apply = utils.apply, extend = utils.extend;
exports.currency = extend({},(function() {
	/**
	 * Currency configurators. They are shown as follows;
	 * dec - decimal separator e.g. between dollars and cents
	 * symbol - the currency symbol, e.g. $
	 * group - grouping (thousands/millions) separator e.g. ,
	 * after - whether to put the currency symbol after the value or before e.g. $2.00 vs 4.00 NIS
	 * currency
	 * country
	 * 
	 * @private
	 */
	var currencies = {
		ALL : {dec : '.', symbol : 'Lek', group : ',', after : false, currency : 'Leke', country : 'Albania', significantFigures: 2},
		AFN : {dec : '.', symbol : '\u060b', group : ',', after : false, currency : 'Afghanis', country : 'Afghanistan', significantFigures: 2},
		ARS : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Argentina', significantFigures: 2},
		AWG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins)', country : 'Aruba', significantFigures: 2},
		AUD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Australia', significantFigures: 2},
		AZN : {dec : '.', symbol : '\u043c\u0430\u043d', group : ',', after : false, currency : 'New Manats', country : 'Azerbaijan', significantFigures: 2},
		BSD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Bahamas', significantFigures: 2},
		BBD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Barbados', significantFigures: 2},
		BYR : {dec : '.', symbol : 'p.', group : ',', after : false, currency : 'Rubles', country : 'Belarus', significantFigures: 2},
		BEF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'Belgium', significantFigures: 2},
		BZD : {dec : '.', symbol : 'BZ$', group : ',', after : false, currency : 'Dollars', country : 'Belize', significantFigures: 2},
		BMD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Bermuda', significantFigures: 2},
		BOB : {dec : '.', symbol : '$b', group : ',', after : false, currency : 'Bolivianos', country : 'Bolivia', significantFigures: 2},
		BAM : {dec : '.', symbol : 'KM', group : ',', after : false, currency : 'Convertible Marka', country : 'Bosnia and Herzegovina', significantFigures: 2},
		BWP : {dec : '.', symbol : 'P', group : ',', after : false, currency : 'Pulas', country : 'Botswana', significantFigures: 2},
		BGN : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Leva', country : 'Bulgaria', significantFigures: 2},
		BRL : {dec : '.', symbol : 'R$', group : ',', after : false, currency : 'Reais', country : 'Brazil', significantFigures: 2},
		BRC : {dec : '.', symbol : '\u20a2', group : ',', after : false, currency : 'Cruzeiros (obsolete)', country : 'Brazil', significantFigures: 2},
		BND : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Brunei Darussalam', significantFigures: 2},
		KHR : {dec : '.', symbol : '\u17db', group : ',', after : false, currency : 'Riels', country : 'Cambodia', significantFigures: 2},
		CAD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Canada', significantFigures: 2},
		KYD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Cayman Islands', significantFigures: 2},
		CLP : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Chile', significantFigures: 2},
		CNY : {dec : '.', symbol : '\u5143', group : ',', after : false, currency : 'Yuan Renminbi', country : 'China', significantFigures: 2},
		COP : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Colombia', significantFigures: 2},
		CRC : {dec : '.', symbol : '\u20a1', group : ',', after : false, currency : 'Colón', country : 'Costa Rica', significantFigures: 2},
		HRK : {dec : '.', symbol : 'kn', group : ',', after : false, currency : 'Kuna', country : 'Croatia', significantFigures: 2},
		CUP : {dec : '.', symbol : '\u20b1', group : ',', after : false, currency : 'Pesos', country : 'Cuba', significantFigures: 2},
		CYP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Cyprus', significantFigures: 2},
		CZK : {dec : '.', symbol : 'K\u010d', group : ',', after : false, currency : 'Koruny', country : 'Czech Republic', significantFigures: 2},
		DKK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kroner', country : 'Denmark', significantFigures: 2},
		DOP : {dec : '.', symbol : 'RD$', group : ',', after : false, currency : 'Pesos', country : 'Dominican Republic', significantFigures: 2},
		XCD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'East Caribbean', significantFigures: 2},
		EGP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Egypt', significantFigures: 2},
		SVC : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Colones', country : 'El Salvador', significantFigures: 2},
		EEK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Krooni', country : 'Estonia', significantFigures: 2},
		EUR : {dec : '.', symbol : '\u20ac', group : ',', after : false, currency : '', country : 'Euro', significantFigures: 2},
		XEU : {dec : '.', symbol : '\u20a0', group : ',', after : false, currency : '', country : 'European Currency Unit (obsolete)', significantFigures: 2},
		FKP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Falkland Islands', significantFigures: 2},
		FJD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Fiji', significantFigures: 2},
		FRF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'France', significantFigures: 2},
		GHC : {dec : '.', symbol : '\u00a2', group : ',', after : false, currency : 'Cedis', country : 'Ghana', significantFigures: 2},
		GIP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Gibraltar', significantFigures: 2},
		GRD : {dec : '.', symbol : '\u20af', group : ',', after : false, currency : 'Drachmae (obsolete)', country : 'Greece', significantFigures: 2},
		GTQ : {dec : '.', symbol : 'Q', group : ',', after : false, currency : 'Quetzales', country : 'Guatemala', significantFigures: 2},
		GGP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Guernsey', significantFigures: 2},
		GYD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Guyana', significantFigures: 2},
		NLG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins) (obsolete)', country : 'Holland (Netherlands)', significantFigures: 2},
		HNL : {dec : '.', symbol : 'L', group : ',', after : false, currency : 'Lempiras', country : 'Honduras', significantFigures: 2},
		HKD : {dec : '.', symbol : 'HK$', group : ',', after : false, currency : 'Dollars (General written use)', country : 'Hong Kong', significantFigures: 2},
		HUF : {dec : '.', symbol : 'Ft', group : ',', after : false, currency : 'Forint', country : 'Hungary', significantFigures: 2},
		ISK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kronur', country : 'Iceland', significantFigures: 2},
		INR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees (Rs or Rs. are commonly used instead of the symbol)', country : 'India', significantFigures: 2},
		IDR : {dec : '.', symbol : 'Rp', group : ',', after : false, currency : 'Rupiahs', country : 'Indonesia', significantFigures: 2},
		IRR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Iran', significantFigures: 2},
		IEP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Punt (obsolete)', country : 'Ireland', significantFigures: 2},
		IMP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Isle of Man', significantFigures: 2},
		ILS : {dec : '.', symbol : '\u20aa', group : ',', after : false, currency : 'New Shekels', country : 'Israel', significantFigures: 2},
		ITL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Lire (obsolete)', country : 'Italy', significantFigures: 2},
		JMD : {dec : '.', symbol : 'J$', group : ',', after : false, currency : 'Dollars', country : 'Jamaica', significantFigures: 2},
		JPY : {dec : '.', symbol : '\u00a5', group : ',', after : false, currency : 'Yen', country : 'Japan', significantFigures: 2},
		JEP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Jersey', significantFigures: 2},
		KZT : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Tenge', country : 'Kazakhstan', significantFigures: 2},
		KGS : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Soms', country : 'Kyrgyzstan', significantFigures: 2},
		LAK : {dec : '.', symbol : '\u20ad', group : ',', after : false, currency : 'Kips', country : 'Laos', significantFigures: 2},
		LVL : {dec : '.', symbol : 'Ls', group : ',', after : false, currency : 'Lati', country : 'Latvia', significantFigures: 2},
		LBP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Lebanon', significantFigures: 2},
		LRD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Liberia', significantFigures: 2},
		LTL : {dec : '.', symbol : 'Lt', group : ',', after : false, currency : 'Litai', country : 'Lithuania', significantFigures: 2},
		LUF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'Luxembourg', significantFigures: 2},
		MKD : {dec : '.', symbol : '\u0434\u0435\u043d', group : ',', after : false, currency : 'Denars', country : 'Macedonia', significantFigures: 2},
		MYR : {dec : '.', symbol : 'RM', group : ',', after : false, currency : 'Ringgits', country : 'Malaysia', significantFigures: 2},
		MTL : {dec : '.', symbol : 'Lm', group : ',', after : false, currency : 'Liri', country : 'Malta', significantFigures: 2},
		MUR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Mauritius', significantFigures: 2},
		MXN : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Mexico', significantFigures: 2},
		MNT : {dec : '.', symbol : '\u20ae', group : ',', after : false, currency : 'Tugriks', country : 'Mongolia', significantFigures: 2},
		MZN : {dec : '.', symbol : 'MT', group : ',', after : false, currency : 'Meticais', country : 'Mozambique', significantFigures: 2},
		NAD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Namibia', significantFigures: 2},
		NPR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Nepal', significantFigures: 2},
		ANG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins)', country : 'Netherlands Antilles', significantFigures: 2},
		NZD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'New Zealand', significantFigures: 2},
		NIO : {dec : '.', symbol : 'C$', group : ',', after : false, currency : 'Cordobas', country : 'Nicaragua', significantFigures: 2},
		NGN : {dec : '.', symbol : '\u20a6', group : ',', after : false, currency : 'Nairas', country : 'Nigeria', significantFigures: 2},
		KPW : {dec : '.', symbol : '\u20a9', group : ',', after : false, currency : 'Won', country : 'North Korea', significantFigures: 2},
		NOK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Krone', country : 'Norway', significantFigures: 2},
		OMR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Oman', significantFigures: 2},
		PKR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Pakistan', significantFigures: 2},
		PAB : {dec : '.', symbol : 'B/.', group : ',', after : false, currency : 'Balboa', country : 'Panama', significantFigures: 2},
		PYG : {dec : '.', symbol : 'Gs', group : ',', after : false, currency : 'Guarani', country : 'Paraguay', significantFigures: 2},
		PEN : {dec : '.', symbol : 'S/.', group : ',', after : false, currency : 'Nuevos Soles', country : 'Peru', significantFigures: 2},
		PHP : {dec : '.', symbol : 'Php', group : ',', after : false, currency : 'Pesos', country : 'Philippines', significantFigures: 2},
		PLN : {dec : '.', symbol : 'z\u0142', group : ',', after : false, currency : 'Zlotych', country : 'Poland', significantFigures: 2},
		QAR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Qatar', significantFigures: 2},
		RON : {dec : '.', symbol : 'lei', group : ',', after : false, currency : 'New Lei', country : 'Romania', significantFigures: 2},
		RUB : {dec : '.', symbol : '\u0440\u0443\u0431', group : ',', after : true, currency : 'Rubles', country : 'Russia', significantFigures: 2},
		SHP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Saint Helena', significantFigures: 2},
		SAR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Riyals', country : 'Saudi Arabia', significantFigures: 2},
		RSD : {dec : '.', symbol : '\u0414\u0438\u043d.', group : ',', after : false, currency : 'Dinars', country : 'Serbia', significantFigures: 2},
		SCR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Seychelles', significantFigures: 2},
		SGD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Singapore', significantFigures: 2},
		SKK : {dec : '.', symbol : 'SIT', group : ',', after : false, currency : 'Koruny', country : 'Slovakia', significantFigures: 2},
		SBD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Solomon Islands', significantFigures: 2},
		SOS : {dec : '.', symbol : 'S', group : ',', after : false, currency : 'Shillings', country : 'Somalia', significantFigures: 2},
		ZAR : {dec : '.', symbol : 'R', group : ',', after : false, currency : 'Rand', country : 'South Africa', significantFigures: 2},
		KRW : {dec : '.', symbol : '\u20a9', group : ',', after : false, currency : 'Won', country : 'South Korea', significantFigures: 2},
		ESP : {dec : '.', symbol : '\u20a7', group : ',', after : false, currency : 'Pesetas (obsolete)', country : 'Spain', significantFigures: 2},
		LKR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Sri Lanka', significantFigures: 2},
		SEK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kronor', country : 'Sweden', significantFigures: 2},
		CHF : {dec : '.', symbol : 'CHF', group : ',', after : false, currency : 'Francs', country : 'Switzerland', significantFigures: 2},
		SRD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Suriname', significantFigures: 2},
		SYP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Syria', significantFigures: 2},
		TWD : {dec : '.', symbol : 'NT$', group : ',', after : false, currency : 'New Dollars', country : 'Taiwan', significantFigures: 2},
		THB : {dec : '.', symbol : '\u0e3f', group : ',', after : false, currency : 'Baht', country : 'Thailand', significantFigures: 2},
		TTD : {dec : '.', symbol : 'TT$', group : ',', after : false, currency : 'Dollars', country : 'Trinidad and Tobago', significantFigures: 2},
		TRY : {dec : '.', symbol : 'YTL', group : ',', after : false, currency : 'New Lira', country : 'Turkey', significantFigures: 2},
		TRL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Liras', country : 'Turkey', significantFigures: 2},
		TVD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Tuvalu', significantFigures: 2},
		UAH : {dec : '.', symbol : '\u20b4', group : ',', after : false, currency : 'Hryvnia', country : 'Ukraine', significantFigures: 2},
		GBP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'United Kingdom', significantFigures: 2},
		USD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'United States of America', significantFigures: 2},
		UYU : {dec : '.', symbol : '$U', group : ',', after : false, currency : 'Pesos', country : 'Uruguay', significantFigures: 2},
		UZS : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Sums', country : 'Uzbekistan', significantFigures: 2},
		VAL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Lire (obsolete)', country : 'Vatican City', significantFigures: 2},
		VEB : {dec : '.', symbol : 'Bs', group : ',', after : false, currency : 'Bolivares', country : 'Venezuela', significantFigures: 2},
		VND : {dec : '.', symbol : '\u20ab', group : ',', after : false, currency : 'Dong', country : 'Vietnam', significantFigures: 2},
		YER : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Yemen', significantFigures: 2},
		ZWD : {dec : '.', symbol : 'Z$', group : ',', after : false, currency : 'Zimbabwe Dollars', country : 'Zimbabwe', significantFigures: 2}
    , BTC : {dec : '.', symbol : '', group: ',', after : false, currency: 'Bitcoins', country : 'N/A', significantFigures: 8}
	};

	return function(a) {
		var abbr = currencies[a] ? a : this.myclass.defaultCurrency, data = currencies[abbr], doMoney, padString;
		padString = function(str, n) {
			var lenString = str.length, paddingLen = n - lenString, padding = (new Array(paddingLen+1)).join('0');
			return str+padding;
		};
		/**
		 * Format a number as a currency.
	     * 
	     * @param {float} value The numeric value to format
	     * @param {String} sep The separator between whole currency and partial (e.g. dollars and cents)
	     * @param {String} symbol The currency symbol
	     * @param {String} comma The separator between thousands, millions, etc.
	     * @param {boolean} after If the currency symbol should go after the currency, default is before
		 * @param {integer} significantFigures The number of significant
		 * figures when formatting the currency.
	     * @return {String} The formatted currency string
	     * @private
	     */
	    doMoney = function(v,dec,symbol,group,after,significantFigures){
			var ps, whole, sub, r, roundingFactor = Math.pow(10, significantFigures);
	        v = (Math.round(v*roundingFactor))/roundingFactor;
	        v = String(v);
	        ps = v.split('.');
	        whole = ps[0];
	        sub = ps[1] ? dec + padString(ps[1], significantFigures) : dec+ padString('0', significantFigures);
			if (!group) {
				group = '';
			}
	        r = /(\d+)(\d{3})/;
	        while (r.test(whole)) {
	            whole = whole.replace(r, '$1' + group + '$2');
	        }
	        v = whole + sub;
			// we have now processed the comma and the separator

			// now we need to do the symbol and before vs after
			if (!symbol) {
				symbol = '';
			}
			if (after) {
				v = v + symbol;
			} else {
		        if(v.charAt(0) === '-'){
		            v = '-' +symbol+ v.substr(1);
		        } else {
					v = symbol + v;
				}			
			}
			return(v);
	    };

		apply(this,/** @scope JSORM.currency.prototype */{
			/**
			 * Format a value of funds in a the given currency. This will correctly handle place separators, currency symbols, decimal separators, 
			 * and location of symbol (before vs. after the amount).
			 * 
			 * @param {float} value The amount to format
			 * @return {String} The formatted value
			 */
			format : function(value) {
				var str = '';
				value = value ? value : 0;
				// now we determine how to render it from the currency
				str = doMoney(value,data.dec,data.symbol,data.group,data.after,data.significantFigures);
				// return the string
				return(str);
			},
			/**
			 * Get the abbreviation for the currency. This is normally the amount passed to the constructor. However, if that amount was not
			 * found, the default currency was used and will be returned.
			 * 
			 * @return {String} Three-letter ISO standard for the currency represented by this object
			 */
			getAbbreviation : function() {
				return(abbr);
			},
			/**
			 * Get the name of this currency. 
			 * 
			 * @return {String} Name of the currency
			 */
			getName : function() {
				return(data.currency);
			},
			/**
			 * Get the name of the country where this currency is used.
			 * 
			 * @return {String} The country name
			 */
			getCountry : function() {
				return(data.country);
			},
			
			getCurrencies : function() {
				var list = [], i;
				for (i in currencies) {
					if (currencies.hasOwnProperty(i) && typeof(currencies[i]) !== "function") {list.push(i);}
				}
				return(list);
			}
		});
	};
}()),{
	/**
	 * Default currency to use. This may be changed to use another currency. However, if you change it to an unknown one, 
	 * the behaviour is unpredictable and strange errors may occur. The default currency <b>must</b> exist in the table.
	 * 
	 * @memberOf JSORM.currency
	 */
	defaultCurrency : 'USD',
	/**
	 * Get the list of acceptable currency symbols in an array
	 * 
	 * @memberOf JSORM.currency
	 * @return {@String} List of acceptable currency symbols
	 */
	getCurrencies : function() {
		return(exports.currency().getCurrencies());
	}
});
