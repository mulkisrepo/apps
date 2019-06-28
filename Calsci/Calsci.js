function $(e){
	return document.getElementById(e);
}
function _(n,e){
	if(typeof e === "undefined") {e=document;}
	return e.getElementsByClassName(n);
}
var Calsci={
	init:function(){
		this.drag = new dragManager($('content'));
		this.add();this.add();this.add();
		t.r();
	},
	add:function(calArea){
		var b,d,e,a,ec;
		if(typeof calArea === "undefined") {
			calArea = document.createElement('div');
			calArea.className = "calArea";
			$('content').appendChild(calArea);
		}else{
			b=true;
			d=_('desc',calArea)[0].value;
			e=_('exp',calArea)[0].value;
			a=_('ans',calArea)[0].innerHTML;
			ec=_('ec',calArea)[0].innerHTML;
		}
		calArea.innerHTML = ' \
		<input class="desc" autocomplete="off" placeholder="Description"/> \
		<span class="ec" onclick="ec=window.getComputedStyle(this.nextElementSibling.nextElementSibling)[\'display\'];this.title=(ec==\'none\'?\'Collapse\':\'Expand\')+\' this Block\';this.innerHTML=(ec==\'none\'?\'▲\':\'▼\');this.parentNode.setAttribute(\'vfx\',(ec==\'none\'?\'\':\(_(\'desc\',this.parentNode)[0].value==\'\'?\'grayed\':\'output\')));" title="Collapse this Block">▲</span> \
		<span onclick="this.parentNode.parentNode.removeChild( this.parentNode);Calsci.drag.reload();" title="Remove this Block">X</span>';//<hr style="margin:0;height:4px;border:none;background-color:#dbdbdb;">\
		
		var cmp = completely(calArea, {
			fontSize : '24px',
			fontFamily : 'Verdana',
			color:'#333',
		});  
		cmp.onChange = function (text) {
		if (text != ''){
			cmp.startFrom = (text.lastIndexOf('[')>text.lastIndexOf('>')?text.lastIndexOf('[')+1:text.lastIndexOf('>')+1);
			cmp.repaint();
			Calsci.calc(text,cmp.input.parentNode.nextElementSibling);
			Calsci.reCalc();
			}
		};
		cmp.options = Object.keys(umc);
		cmp.input.placeholder="Expression"
		cmp.input.className = "exp";
		cmp.input.name = "txtExp";
		cmp.input.addEventListener('keyup', function (e) {
		if(e.keyCode==13){
			if(cmp.input.parentNode.parentNode.nextElementSibling){
				_('exp',cmp.input.parentNode.parentNode.nextElementSibling)[0].focus();
			}else{
				_('exp')[0].focus();
			}
		};
		}, false);
		cmp.input.style= "position:relative;display:block;"
		cmp.hint.className = "hint";
		cmp.hint.name = "txtHint";
		cmp.hint.disabled = true;
		cmp.hint.style= "position:absolute;color:gray;" 
		var ans = document.createElement('div');
		ans.className= "ans";
		ans.innerHTML=" .";
		calArea.appendChild(ans);
		if(b){
			_('desc',calArea)[0].value=d;
			_('exp',calArea)[0].value=e;
			_('ans',calArea)[0].innerHTML=a;
			_('ec',calArea)[0].innerHTML=ec;
		}
		this.drag.reload();
	},
	getData:function(){
		for(var o=document.getElementsByTagName("input"),i=0;i<o.length;i++)o[i].setAttribute('value',o[i].value);
		return $('content').innerHTML;
	},
	setData: function(t,c){
		$('title').innerHTML = t;
		$('content').innerHTML= c;
		for(var i=0;i<_('calArea').length;i++){this.add(_('calArea')[i]);}
		this.reCalc();this.reCalc();
	},
	reCalc:function(){
		for(var i=0;i<_('exp').length;i++){
			this.calc(_('exp')[i].value,_('exp')[i].parentNode.nextElementSibling);
		}
	},
	calc:function(exp,elem){
		try{
			document.title="Calsci \u00A9 Karthik Narayana";
			var matches = [];
			exp.replace(/(?![^\w])[\w]+(\.[\w]+)?\[(.*?)\]/g, function(g0,g1){matches.push(g0);});
			if(matches.length>0){
				for(var i=0;i<matches.length;i++){	
					var val = matches[i].split("[")[0];
					if(window[val]){
						val=window[val];		
					}else{
						if(isNaN(val)){throw {message: val + " is not defined"};}
					}
					var uom = matches[i].split("[")[1].replace("]","");
					if(uom.split(">").length==2){
						var fmc = umc[uom.split(">")[0]];
						if (!fmc){throw {message:"Unit " + uom.split(">")[0] + " not supported"};}
						var tmc = umc[uom.split(">")[1]];
						if (!tmc){throw {message:"Unit " + uom.split(">")[1] + " not supported"};}
						var fac = fmc.split('/')[1]||0;
						var fmc = fmc.split('/')[0];
						var tac = tmc.split('/')[1]||0;
						var tmc = tmc.split('/')[0];
						var uc = (val*1+fac*1)*fmc/tmc-tac;
						exp = exp.replace(matches[i],"1*("+uc+")");
					}else{
						throw {message:"Syntax Error. Eg: [in>mm]"};
					}
				}
			}
			var val=eval(exp);
			elem.innerHTML=(val==0?0:val || '&nbsp;'); 
			elem.setAttribute('vfx','');
		}catch(e){
			elem.innerHTML="Error: "+ e.message || '&nbsp;';
			elem.setAttribute('vfx','Error');
		}
	}
}
function dragManager(list) {
  var draggableList,
  draggableItemOffsets = [],
  draggingItem,
  draggingItemClone,
  lastListItem = false,
  dragging = false;
 
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
  this.list = list;
  this.reload = function () {
    draggableList = this.list;
    for (i = 0; i < draggableList.children.length; i++) {
      var draggableListItem = draggableList.children[i];
      draggableItemOffsets[i] = [getElementY(draggableListItem), getElementY(draggableListItem) + draggableListItem.offsetHeight];
  }
  };

  function onMouseDown(event) {
    event = event || window.event;
    var element = event.target || event.srcElement;
    if (isDraggableListItem(element)) {
      draggingItem = element;
      draggingItemClone = draggingItem.cloneNode(true);

      draggingItem.style.opacity = 0;

      draggingItemClone.classList.toggle('dragging');
      draggingItemClone.style.width = computedStyle(draggingItem).width;
     draggingItemClone.style.top = event.clientY - Math.floor(draggingItem.clientHeight / 2) + 'px';

      draggableList.appendChild(draggingItemClone);

      dragging = true;
      window.requestAnimationFrame(update);
      document.body.style.cursor = 'ns-resize';
    }
  };

  function onMouseUp() {
    if (dragging) {
      dragging = false;
      document.body.style.cursor = null;
      draggableList.removeChild(draggingItemClone);
      draggingItem.style.opacity = null;
    }
  };

  var currentY = 0;

  function onMouseMove(event) {
    event = event || window.event;
    currentY = event.clientY;
  };

  function update() {
    if (dragging) {
      window.requestAnimationFrame(update);
    }
    draggingItemClone.style.top = currentY - draggingItem.clientHeight / 2 + 'px';

    var cursorY = currentY + window.scrollY,
    dropListItem;

    for (i = 0; i < draggableItemOffsets.length; i++) {
      if (cursorY > draggableItemOffsets[i][0] && cursorY < draggableItemOffsets[i][1]) {
        lastListItem = i === draggableItemOffsets.length - 1;
        dropListItem = draggableList.children[i];
        break;
      } else {
        dropListItem = null;
      }
    }

    if (dropListItem !== null && dropListItem !== draggingItem) {
      if (!lastListItem) {
        draggableList.insertBefore(draggingItem, dropListItem);
      } else {
        draggableList.appendChild(draggingItem);
      }
    }
	
  }

  function getElementY(element) {
    var y = 0;
    while (element.offsetParent) {
      y += element.offsetTop;
      element = element.offsetParent;
    }
    y += element.offsetTop;
    return y;
  }

  function isDraggableListItem(element) {
    return element.className !== 'dragging' && element.parentNode === draggableList;
  }

  function computedStyle(element) {
    return window.getComputedStyle(element) || element.currentStyle;
  }

  this.reload();
}
var ac=[],cu=[],t = {
        t: {},
        c: function() {
                var e = prompt("Call new template as ", $('title').textContent);				
                e && "" != e && (t.t[e] ? confirm(e + " already exists, Overwrite?") && ($('title').innerHTML = e,t.t[e] = Calsci.getData(), this.s()) : ($('title').innerHTML = e,t.t[e] =  Calsci.getData(), this.s()))        
        },
		c1: function() {
			var i,e = prompt("Paste copied template");	
			e && "" != e && (i=e.split("``")) && (t.t[i[0]] ? confirm(i[0] + " already exists, Overwrite?") && ($('title').innerHTML = i[0],t.t[i[0]] = i[1], this.s()) : ($('title').innerHTML = i[0],t.t[i[0]] = i[1], this.s()))   				
        },
		c2: function(e) {
			var a = document.createElement("textarea");
			a.value = e+"``"+t.t[e];
			document.body.appendChild(a);
			a.focus();
			a.select();
			document.execCommand('copy');
			document.body.removeChild(a);
			alert(e +' Template Copied to Clipboard!');			
        },
        d: function(e) {//console.log(e);
            delete t.t[e], localStorage.setItem("CalsciTemplates", JSON.stringify(t.t)),t.r();	
		},
        l: function(e) {//console.log('loading template '+ t.t[e]);
			Calsci.setData(e,t.t[e]);
        },
        r: function() {
            t.t = JSON.parse(localStorage.getItem("CalsciTemplates")) || {}, $("template").children[1].innerHTML = '<li onclick="t.c();">Save As Template<div onclick="event.stopPropagation();t.c1();" title="Paste Copied Template">&#9113;</div></li><li onclick="t.l(this.textContent.slice(0, -2))">' + Object.keys(t.t).sort().join('<div onclick="t.d(this.parentElement.textContent.slice(0, -2))" title="Remove this Template">X</div><div onclick="t.c2(this.parentElement.textContent.slice(0, -2))" title="Copy this Template">&#10697;</div></li><li onclick="t.l(this.textContent.slice(0, -2))">') + '<div onclick="event.stopPropagation();t.d(this.parentElement.textContent.slice(0, -2));" title="Remove this Template">X</div><div onclick="t.c2(this.parentElement.textContent.slice(0, -2))" title="Copy this Template">&#10697;</div></li>'
        },
        s: function() {
            localStorage.setItem("CalsciTemplates", JSON.stringify(t.t)), t.r()
        }
    }
var umc={// "{your unit}":"{value in base unit}", (Use / for additional constants)
//Flowrate
	"kg/sec":"1",
	"kg/hr":"0.000277777777778",
	"tonm/day":"0.0115740740741",
//Temperature 
    "K":"1.8/0",
    "C":"1.8/273.15",
    "R":"1/0",
    "F":"1/459.67",
//Pressure
    "dyne/cm2":"0.1/0",
    "N/m2":"1/0",
    "Pa":"1/0",
    "kPa":"1000/0",
    "MPa":"1000000/0",
    "Pag":"1/101325",
    "kPag":"1000/101.325",
    "MPag":"1000000/0.101325",
    "mbar":"100/0",
    "bar":"100000/0",
    "mbarg":"100/1013.25",
    "barg":"100000/1.01325",
    "in Hg":"3386.39/0",
    "mm Hg":"133.322368421/0",
    "mm Hg@0C":"133.323/0",
    "in Hg@60F":"3377/0",
    "in Hg@32F":"3386.41/0",
    "in Hgg":"3386.39/29.9212598425",
    "mm Hgg":"133.322368421/760",
    "torr":"133.322368421/0",
    "kg/cm2":"98066.5/0",
    "kg/cm2g":"98066.5/1.03323",
    "ata":"98066.5/0",
    "ate":"98066.5/1.03323",
    "atm":"101325/0",
    "psia":"6894.76/0",
    "psig":"6894.76/14.6959",
    "psi":"6894.76/0",
    "psf":"47.8803/0",
    "in H2O":"248.843/0",
    "in H2Og":"248.843/407.18445",
    "mm H2O":"9.79698/0",
    "mm H2Og":"/9.79698",
    "cm H2O":"97.9698/0",
    "ft H2O":"2986.11/0",
    "ft H2Og":"2986.11/33.932106",
    "in H2O@60F":"248.8/0",
    "in H2O@39.2F":"249.082/0",
    "cm H2O@4C":"98.0642/0",
//Time
    "sec":"1",
    "min":"60",
    "hr":"3600",
    "day":"86400",
    "wk":"604800",
    "mon":"2592000",
    "yr":"31557600",
//Length
    "ang":"0.00000001",
    "mmic":"0.0000001",
    "mic":"0.0001",
    "mm":"0.1",
    "cm":"1",
    "dm":"10",
    "m":"100",
    "km":"100000",
    "in":"2.54",
    "ft":"30.48",
    "yd":"91.44",
    "mi":"160934",
//Area
    "ang2":"0.0000000000000001",
    "mmic2":"0.00000000000001",
    "mic2":"0.00000001",
    "mm2":"0.01",
    "cm2":"1",
    "dm2":"100",
    "m2":"10000",
    "km2":"10000000000",
    "in2":"6.4516",
    "ft2":"929.03",
    "yd2":"8361.27",
    "mi2":"25899900000",
    "hect":"100000000",
    "acre":"40468600",
//Volume
    "ang3":"1E-24",
    "mmic3":"1E-21",
    "mic3":"0.000000000001",
    "mm3":"0.001",
    "cm3":"1",
    "dm3":"1000",
    "m3":"1000000",
    "km3":"1000000000000000",
    "in3":"16.3871",
    "ft3":"28316.9",
    "yd3":"764555",
    "mi3":"4154190000000000",
    "liter":"1000",
    "gal":"3785.41",
    "igal":"4546.09",
    "bbl":"158987",
    "Mbbl":"158987000",
    "KL":"1000000",
    "Mft3":"28316900",
    "Mgal":"3785410",
    "MMft3":"28316900000",
    "MMgal":"3785410000",
//Mass
    "g":"0.001",
    "kg":"1",
    "tonm":"1000",
    "oz":"0.0283495",
    "lb":"0.453592",
    "klb":"453.592",
    "ton":"907.185",
    "tonl":"1016.05",
    "Ktonm":"1000000",
//mole
    "g-mol":"0.001",
    "kg-mol":"1",
    "tonm-mol":"1000",
    "oz-mol":"0.0283495",
    "lb-mol":"0.453592",
    "ton-mol":"907.185",
    "tonl-mol":"1016.05",
    "Ktonm-mol":"1000000",
//Energy
    "J":"1",
    "kJ":"1000",
    "MJ":"1000000",
    "cal":"4.1868",
    "kcal":"4186.8",
    "g-cm":"0.0000980665",
    "kg-m":"9.80665",
    "ft-lb":"1.35582",
    "BTU":"1055.06",
    "CHU":"1899.1",
    "PCU":"1899.1",
    "kW-hr":"3600000",
//Power
    "W":"1",
    "kW":"1000",
    "MW":"1000000",
    "VA":"1",
    "KVA":"1000",
    "MVA":"1000000",
    "VAR":"1",
    "kVAR":"1000",
    "MVAR":"1000000",
    "HP":"745.697",
//Henry
    "H":"1",
    "mH":"0.001",
    "muH":"0.000001",
//Farad
    "F":"1",
    "mF":"0.001",
    "muF":"0.000001",
//E6Energy
    "x 10^6 J":"1000000",
    "x 10^6 kJ":"1000000000",
    "x 10^6 MJ":"1000000000000",
    "x 10^6 cal":"4186800",
    "x 10^6 Kcal":"4186800000",
    "x 10^6 gcm":"98.0665",
    "x 10^6 kgm":"9806650",
    "x 10^6 ftlb":"1355820",
    "x 10^6 BTU":"1055060000",
    "x 10^6 CHU":"1899100000",
    "x 10^6 PCU":"1899100000",
    "x 10^6 KWH":"3600000000000",
    "x 10^6 W":"1000000",
    "x 10^6 kW":"1000000000",
    "x 10^6 MW":"1000000000000",
    "x 10^6 VA":"1000000",
    "x 10^6 VAR":"1000000",
    "x 10^6 HP":"745697000",
//Viscosity
    "cP":"1",
    "POIS":"100",
    "Pa-sec":"1000",
    "kg/m-sec":"1000",
    "kg/m-min":"16.6667",
    "kg/m-hr":"0.277778",
    "kg/m-day":"0.0115741",
    "lb/ft-sec":"1488.16",
    "lb/ft-min":"24.8027",
    "lb/ft-hr":"0.413379",
    "lb/ft-day":"0.0172242",
    "lb-sec/ft2":"47880.1",
//Conductivity
    "W/m-K":"1",
    "W/m-C":"1",
    "kW/m-K":"1000",
    "kW/m-C":"1000",
    "cal/sec-cm-C":"418.68",
    "cal/hr-m-C":"0.001163",
    "kcal/hr-m-C":"1.163",
    "BTU/hr-ft-F":"1.73074",
//SufaceTension
    "g/cm":"1",
    "Dyne/cm":"0.00101972",
    "N/m":"1.01972",
    "PDL/in":"5.55043",
//Heat Transfer Coefficients
    "W/m2-K":"1",
    "W/m2-C":"1",
    "kW/m2-K":"1000",
    "cal/sec-cm2-C":"41868",
    "kcal/hr-m2-C":"1.163",
    "kcal/hr-m2-K":"1.163",
    "kJ/hr-m2-K":"0.277778",
    "BTU/hr-ft2-F":"5.67826",
//Thermal conductance 
    "W/K":"1",
    "kW/K":"1000",
    "kcal/hr-K":"1.163",
    "kJ/hr-K":"0.277778",
    "BTU/hr-F":"0.527527",
//Foul
    "m2-K/W":"1",
    "m2-K/kW":"0.001",
    "hr-m2-C/kcal":"0.859845",
    "hr-m2-K/kJ":"3.6",
    "hr-ft2-F/BTU":"0.17611",
//API
    "API":"1",
    "spgr":"0.000999014",
//electrostatic charge
    "DEB":"1",
    "Coul-m":"2.99792E+29",
    "EU":"1000000000000000000",
//kinematic viscosity
    "cST":"1",
    "ST":"100",
    "in2/sec":"645.16",
    "m2/sec":"1000000",
//specific heat capacity
    "J/g-K":"1",
    "J/kg-K":"0.001",
    "kJ/g-K":"1000",
    "kJ/kg-K":"1",
    "MJ/g-K":"1000000",
    "MJ/kg-K":"1000",
    "cal/g-K":"4.1868",
    "cal/kg-K":"0.0041868",
    "kcal/g-K":"4186.8",
    "kcal/kg-K":"4.1868",
    "BTU/lb-F":"4.1868",
    "BTU/lb-C":"2.32601",
    "BTU/lb-K":"2.32601",
    "CHU/g-F":"3418.38",
    "CHU/kg-F":"3.41838",
    "CHU/lb-F":"7.53624",
    "PCU/g-F":"3418.38",
    "PCU/kg-F":"3.41838",
    "PCU/lb-F":"7.53624",
    "J/g-C":"1",
    "J/kg-C":"0.001",
    "kJ/g-C":"1000",
    "kJ/kg-C":"1",
    "cal/g-C":"4.1868",
    "cal/kg-C":"0.0041868",
    "kcal/g-C":"4186.8",
    "kcal/kg-C":"4.1868",
//Torque
    "N-m":"1",
    "lb-ft":"1.35581",
//fraction
    "fraction":"1",
    "p.u.":"1",
    "percent":"0.01",
    "ppm":"0.000001",
    "ppb":"0.000000001",
//Currency
    "$":"1",
    "ALL":"0.0092",
    "DZD":"0.0085",
    "AOA":"0.0039",
    "ARS":"0.0363",
    "AMD":"0.0021",
    "AUD":"0.7357",
    "AZN":"0.5876",
    "BSD":"0.9946",
    "BHD":"2.6426",
    "BDT":"0.0118",
    "BBD":"0.5",
    "BYN":"0.5029",
    "BZD":"0.4972",
    "BMD":"1",
    "BOB":"0.1439",
    "BAM":"0.5944",
    "BWP":"0.0972",
    "BRL":"0.2606",
    "GBP":"1.3034",
    "BND":"0.6618",
    "BGN":"0.5941",
    "BIF":"0.0006",
    "KHR":"0.0002",
    "CAD":"0.755",
    "CVE":"0.0106",
    "KYD":"1.2195",
    "XOF":"0.0018",
    "XAF":"0.0018",
    "XPF":"0.0097",
    "CLP":"0.0015",
    "CNY":"0.1488",
    "COP":"0.0003",
    "CRC":"0.0018",
    "HRK":"0.1572",
    "CUP":"0.9944",
    "CZK":"0.0449",
    "DKK":"0.1559",
    "DJF":"0.0056",
    "DOP":"0.02",
    "XCD":"0.37",
    "EGP":"0.0559",
    "ERN":"0.0666",
    "ETB":"0.0361",
    "EUR":"1.1619",
    "FJD":"0.4761",
    "GMD":"0.0209",
    "GEL":"0.4068",
    "GHS":"0.208",
    "GTQ":"0.1334",
    "GNF":"0.0001",
    "HTG":"0.0153",
    "HNL":"0.0415",
    "HKD":"0.1274",
    "HUF":"0.0036",
    "ISK":"0.0093",
    "INR":"0.0146",
    "IDR":"0.0001",
    "IRR":"0",
    "IQD":"0.0008",
    "ILS":"0.2746",
    "JMD":"0.0076",
    "JPY":"0.0089",
    "JOD":"1.4082",
    "KZT":"0.0029",
    "KES":"0.0099",
    "KRW":"0.0009",
    "KWD":"3.2995",
    "KGS":"0.0147",
    "LAK":"0.0001",
    "LBP":"0.0007",
    "LSL":"0.0754",
    "LYD":"0.724",
    "MOP":"0.1237",
    "MKD":"0.0189",
    "MWK":"0.0014",
    "MYR":"0.2465",
    "MUR":"0.029",
    "MXN":"0.0527",
    "MDL":"0.0599",
    "MAD":"0.1053",
    "MMK":"0.0007",
    "NAD":"0.0753",
    "NPR":"0.0091",
    "ANG":"0.5586",
    "NZD":"0.6764",
    "NIO":"0.0313",
    "NGN":"0.0028",
    "NOK":"0.1223",
    "OMR":"2.5976",
    "PKR":"0.0078",
    "PAB":"0.9948",
    "PYG":"0.0002",
    "PEN":"0.3055",
    "PHP":"0.0187",
    "PLN":"0.2696",
    "QAR":"0.2746",
    "RON":"0.2496",
    "RUB":"0.0159",
    "RWF":"0.0012",
    "SAR":"0.2666",
    "RSD":"0.0098",
    "SCR":"0.0738",
    "SGD":"0.731",
    "SOS":"0.0017",
    "ZAR":"0.075",
    "LKR":"0.0063",
    "SDG":"0.0556",
    "SZL":"0.0749",
    "SEK":"0.1128",
    "CHF":"0.9995",
    "SYP":"0.0019",
    "TWD":"0.0326",
    "TZS":"0.0004",
    "THB":"0.03",
    "TTD":"0.1476",
    "TND":"0.3752",
    "TRY":"0.2089",
    "TMT":"0.2857",
    "UGX":"0.0003",
    "UAH":"0.0381",
    "AED":"0.2722",
    "UYU":"0.0317",
    "USD":"1",
    "UZS":"0.0001",
    "VEF":"0",
    "VND":"0",
    "YER":"0.004",
    "ZMW":"0.0992",
//speed
    "rps":"1",
    "rpm":"0.0166666666667",
    "rph":"0.000277777777778",
    "rpd":"0.0000115740740741",
    "rad/sec":"0.1591549431",
//angle
    "revolution":"1",
    "degree":"0.002777777778",
    "radian":"0.1591549431",
//volt
    "V":"1",
    "kV":"1000",
//current
    "Amp":"1",
    "kAmp":"1000",
//resistance
    "Ohm":"1",
    "kOhm":"1000",
//Flow Conductance
    "Cv":"0.0000240152927537",
    "gpm/sqrt(psi-spgr)":"0.0000240152927537",
    "(kg/sec)/sqrt(Pa-kg/m3)":"1",
    "(kg/sec)/sqrt(kPa-kg/m3)":"0.0316227766017",
    "(lb/sec)/sqrt(inH2O-lb/ft3)":"0.00718443851618",
    "(lb/sec)/sqrt(psi-lb/ft3)":"0.00136488471428",
    "(lb/hr)/sqrt(psi-lb/ft3)":"0.000000379134642857",
    "Kv":"0.0000277669618",
	//null
	"null":"0"
};
