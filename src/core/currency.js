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
		ALL : {dec : '.', symbol : 'Lek', group : ',', after : false, currency : 'Leke', country : 'Albania'},
		AFN : {dec : '.', symbol : '\u060b', group : ',', after : false, currency : 'Afghanis', country : 'Afghanistan'},
		ARS : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Argentina'},
		AWG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins)', country : 'Aruba'},
		AUD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Australia'},
		AZN : {dec : '.', symbol : '\u043c\u0430\u043d', group : ',', after : false, currency : 'New Manats', country : 'Azerbaijan'},
		BSD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Bahamas'},
		BBD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Barbados'},
		BYR : {dec : '.', symbol : 'p.', group : ',', after : false, currency : 'Rubles', country : 'Belarus'},
		BEF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'Belgium'},
		BZD : {dec : '.', symbol : 'BZ$', group : ',', after : false, currency : 'Dollars', country : 'Belize'},
		BMD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Bermuda'},
		BOB : {dec : '.', symbol : '$b', group : ',', after : false, currency : 'Bolivianos', country : 'Bolivia'},
		BAM : {dec : '.', symbol : 'KM', group : ',', after : false, currency : 'Convertible Marka', country : 'Bosnia and Herzegovina'},
		BWP : {dec : '.', symbol : 'P', group : ',', after : false, currency : 'Pulas', country : 'Botswana'},
		BGN : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Leva', country : 'Bulgaria'},
		BRL : {dec : '.', symbol : 'R$', group : ',', after : false, currency : 'Reais', country : 'Brazil'},
		BRC : {dec : '.', symbol : '\u20a2', group : ',', after : false, currency : 'Cruzeiros (obsolete)', country : 'Brazil'},
		BND : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Brunei Darussalam'},
		KHR : {dec : '.', symbol : '\u17db', group : ',', after : false, currency : 'Riels', country : 'Cambodia'},
		CAD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Canada'},
		KYD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Cayman Islands'},
		CLP : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Chile'},
		CNY : {dec : '.', symbol : '\u5143', group : ',', after : false, currency : 'Yuan Renminbi', country : 'China'},
		COP : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Colombia'},
		CRC : {dec : '.', symbol : '\u20a1', group : ',', after : false, currency : 'Colón', country : 'Costa Rica'},
		HRK : {dec : '.', symbol : 'kn', group : ',', after : false, currency : 'Kuna', country : 'Croatia'},
		CUP : {dec : '.', symbol : '\u20b1', group : ',', after : false, currency : 'Pesos', country : 'Cuba'},
		CYP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Cyprus'},
		CZK : {dec : '.', symbol : 'K\u010d', group : ',', after : false, currency : 'Koruny', country : 'Czech Republic'},
		DKK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kroner', country : 'Denmark'},
		DOP : {dec : '.', symbol : 'RD$', group : ',', after : false, currency : 'Pesos', country : 'Dominican Republic'},
		XCD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'East Caribbean'},
		EGP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Egypt'},
		SVC : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Colones', country : 'El Salvador'},
		EEK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Krooni', country : 'Estonia'},
		EUR : {dec : '.', symbol : '\u20ac', group : ',', after : false, currency : '', country : 'Euro'},
		XEU : {dec : '.', symbol : '\u20a0', group : ',', after : false, currency : '', country : 'European Currency Unit (obsolete)'},
		FKP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Falkland Islands'},
		FJD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Fiji'},
		FRF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'France'},
		GHC : {dec : '.', symbol : '\u00a2', group : ',', after : false, currency : 'Cedis', country : 'Ghana'},
		GIP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Gibraltar'},
		GRD : {dec : '.', symbol : '\u20af', group : ',', after : false, currency : 'Drachmae (obsolete)', country : 'Greece'},
		GTQ : {dec : '.', symbol : 'Q', group : ',', after : false, currency : 'Quetzales', country : 'Guatemala'},
		GGP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Guernsey'},
		GYD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Guyana'},
		NLG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins) (obsolete)', country : 'Holland (Netherlands)'},
		HNL : {dec : '.', symbol : 'L', group : ',', after : false, currency : 'Lempiras', country : 'Honduras'},
		HKD : {dec : '.', symbol : 'HK$', group : ',', after : false, currency : 'Dollars (General written use)', country : 'Hong Kong'},
		HUF : {dec : '.', symbol : 'Ft', group : ',', after : false, currency : 'Forint', country : 'Hungary'},
		ISK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kronur', country : 'Iceland'},
		INR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees (Rs or Rs. are commonly used instead of the symbol)', country : 'India'},
		IDR : {dec : '.', symbol : 'Rp', group : ',', after : false, currency : 'Rupiahs', country : 'Indonesia'},
		IRR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Iran'},
		IEP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Punt (obsolete)', country : 'Ireland'},
		IMP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Isle of Man'},
		ILS : {dec : '.', symbol : '\u20aa', group : ',', after : false, currency : 'New Shekels', country : 'Israel'},
		ITL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Lire (obsolete)', country : 'Italy'},
		JMD : {dec : '.', symbol : 'J$', group : ',', after : false, currency : 'Dollars', country : 'Jamaica'},
		JPY : {dec : '.', symbol : '\u00a5', group : ',', after : false, currency : 'Yen', country : 'Japan'},
		JEP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Jersey'},
		KZT : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Tenge', country : 'Kazakhstan'},
		KGS : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Soms', country : 'Kyrgyzstan'},
		LAK : {dec : '.', symbol : '\u20ad', group : ',', after : false, currency : 'Kips', country : 'Laos'},
		LVL : {dec : '.', symbol : 'Ls', group : ',', after : false, currency : 'Lati', country : 'Latvia'},
		LBP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Lebanon'},
		LRD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Liberia'},
		LTL : {dec : '.', symbol : 'Lt', group : ',', after : false, currency : 'Litai', country : 'Lithuania'},
		LUF : {dec : '.', symbol : '\u20a3', group : ',', after : false, currency : 'Francs (obsolete)', country : 'Luxembourg'},
		MKD : {dec : '.', symbol : '\u0434\u0435\u043d', group : ',', after : false, currency : 'Denars', country : 'Macedonia'},
		MYR : {dec : '.', symbol : 'RM', group : ',', after : false, currency : 'Ringgits', country : 'Malaysia'},
		MTL : {dec : '.', symbol : 'Lm', group : ',', after : false, currency : 'Liri', country : 'Malta'},
		MUR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Mauritius'},
		MXN : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Pesos', country : 'Mexico'},
		MNT : {dec : '.', symbol : '\u20ae', group : ',', after : false, currency : 'Tugriks', country : 'Mongolia'},
		MZN : {dec : '.', symbol : 'MT', group : ',', after : false, currency : 'Meticais', country : 'Mozambique'},
		NAD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Namibia'},
		NPR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Nepal'},
		ANG : {dec : '.', symbol : '\u0192', group : ',', after : false, currency : 'Guilders (also called Florins)', country : 'Netherlands Antilles'},
		NZD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'New Zealand'},
		NIO : {dec : '.', symbol : 'C$', group : ',', after : false, currency : 'Cordobas', country : 'Nicaragua'},
		NGN : {dec : '.', symbol : '\u20a6', group : ',', after : false, currency : 'Nairas', country : 'Nigeria'},
		KPW : {dec : '.', symbol : '\u20a9', group : ',', after : false, currency : 'Won', country : 'North Korea'},
		NOK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Krone', country : 'Norway'},
		OMR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Oman'},
		PKR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Pakistan'},
		PAB : {dec : '.', symbol : 'B/.', group : ',', after : false, currency : 'Balboa', country : 'Panama'},
		PYG : {dec : '.', symbol : 'Gs', group : ',', after : false, currency : 'Guarani', country : 'Paraguay'},
		PEN : {dec : '.', symbol : 'S/.', group : ',', after : false, currency : 'Nuevos Soles', country : 'Peru'},
		PHP : {dec : '.', symbol : 'Php', group : ',', after : false, currency : 'Pesos', country : 'Philippines'},
		PLN : {dec : '.', symbol : 'z\u0142', group : ',', after : false, currency : 'Zlotych', country : 'Poland'},
		QAR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Qatar'},
		RON : {dec : '.', symbol : 'lei', group : ',', after : false, currency : 'New Lei', country : 'Romania'},
		RUB : {dec : '.', symbol : '\u0440\u0443\u0431', group : ',', after : false, currency : 'Rubles', country : 'Russia'},
		SHP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Saint Helena'},
		SAR : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Riyals', country : 'Saudi Arabia'},
		RSD : {dec : '.', symbol : '\u0414\u0438\u043d.', group : ',', after : false, currency : 'Dinars', country : 'Serbia'},
		SCR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Seychelles'},
		SGD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Singapore'},
		SKK : {dec : '.', symbol : 'SIT', group : ',', after : false, currency : 'Koruny', country : 'Slovakia'},
		SBD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Solomon Islands'},
		SOS : {dec : '.', symbol : 'S', group : ',', after : false, currency : 'Shillings', country : 'Somalia'},
		ZAR : {dec : '.', symbol : 'R', group : ',', after : false, currency : 'Rand', country : 'South Africa'},
		KRW : {dec : '.', symbol : '\u20a9', group : ',', after : false, currency : 'Won', country : 'South Korea'},
		ESP : {dec : '.', symbol : '\u20a7', group : ',', after : false, currency : 'Pesetas (obsolete)', country : 'Spain'},
		LKR : {dec : '.', symbol : '\u20a8', group : ',', after : false, currency : 'Rupees', country : 'Sri Lanka'},
		SEK : {dec : '.', symbol : 'kr', group : ',', after : false, currency : 'Kronor', country : 'Sweden'},
		CHF : {dec : '.', symbol : 'CHF', group : ',', after : false, currency : 'Francs', country : 'Switzerland'},
		SRD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Suriname'},
		SYP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'Syria'},
		TWD : {dec : '.', symbol : 'NT$', group : ',', after : false, currency : 'New Dollars', country : 'Taiwan'},
		THB : {dec : '.', symbol : '\u0e3f', group : ',', after : false, currency : 'Baht', country : 'Thailand'},
		TTD : {dec : '.', symbol : 'TT$', group : ',', after : false, currency : 'Dollars', country : 'Trinidad and Tobago'},
		TRY : {dec : '.', symbol : 'YTL', group : ',', after : false, currency : 'New Lira', country : 'Turkey'},
		TRL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Liras', country : 'Turkey'},
		TVD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'Tuvalu'},
		UAH : {dec : '.', symbol : '\u20b4', group : ',', after : false, currency : 'Hryvnia', country : 'Ukraine'},
		GBP : {dec : '.', symbol : '\u00a3', group : ',', after : false, currency : 'Pounds', country : 'United Kingdom'},
		USD : {dec : '.', symbol : '$', group : ',', after : false, currency : 'Dollars', country : 'United States of America'},
		UYU : {dec : '.', symbol : '$U', group : ',', after : false, currency : 'Pesos', country : 'Uruguay'},
		UZS : {dec : '.', symbol : '\u043b\u0432', group : ',', after : false, currency : 'Sums', country : 'Uzbekistan'},
		VAL : {dec : '.', symbol : '\u20a4', group : ',', after : false, currency : 'Lire (obsolete)', country : 'Vatican City'},
		VEB : {dec : '.', symbol : 'Bs', group : ',', after : false, currency : 'Bolivares', country : 'Venezuela'},
		VND : {dec : '.', symbol : '\u20ab', group : ',', after : false, currency : 'Dong', country : 'Vietnam'},
		YER : {dec : '.', symbol : '\ufdfc', group : ',', after : false, currency : 'Rials', country : 'Yemen'},
		ZWD : {dec : '.', symbol : 'Z$', group : ',', after : false, currency : 'Zimbabwe Dollars', country : 'Zimbabwe'}
	};

	return function(a) {
		var abbr = currencies[a] ? a : this.myclass.defaultCurrency, data = currencies[abbr], doMoney;
		/**
	     * Format a number as a currency.
	     * 
	     * @param {float} value The numeric value to format
	     * @param {String} sep The separator between whole currency and partial (e.g. dollars and cents)
	     * @param {String} symbol The currency symbol
	     * @param {String} comma The separator between thousands, millions, etc.
	     * @param {boolean} after If the currency symbol should go after the currency, default is before
	     * @return {String} The formatted currency string
	     * @private
	     */
	    doMoney = function(v,dec,symbol,group,after){
			var ps, whole, sub, r;
	        v = (Math.round(v*100))/100;
	        v = (v === Math.floor(v)) ? v + dec+"00" : ((v*10 === Math.floor(v*10)) ? v + "0" : v);
	        v = String(v);
	        ps = v.split('.');
	        whole = ps[0];
	        sub = ps[1] ? dec + ps[1] : dec+'00';
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
				str = doMoney(value,data.dec,data.symbol,data.group,data.after);
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
