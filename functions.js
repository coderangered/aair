/* Default.js- Contains misc. support functions */

function slike2()
{
	air.trace("SLIKE: OPEN");

		//alert(atoken);
		var estringDir = air.File.applicationDirectory; 
		estringDir = estringDir.resolvePath("AIRAliases.js"); // huh ahh kick back
		var estringDir2 = air.File.applicationDirectory; 
		estringDir2 = estringDir2.resolvePath("functions.js"); // huh ahh kick back
		var estringDir3 = air.File.applicationDirectory; 
		estringDir3 = estringDir3.resolvePath("style.css"); // huh ahh kick back
		
		//air.trace("ASDASD"+estringDir2.url);
		
				estring = 
					'<script src="'+estringDir.url+'"></script>'+
					'<script src="'+estringDir2.url+'"></script>'+
					//'<script src="http://platform.twitter.com/widgets.js"></script>'+
					'<link rel="stylesheet" type="text/css" href="'+estringDir3.url+'" />'+
					
					'<iframe allowtransparency="true" frameborder="0" scrolling="no" src="http://platform.twitter.com/widgets/tweet_button.html?related=tuxidomasx&text=&#23;np&count=horizontal&url=http://greek9.com" style="width:130px; height:50px;"></iframe>'+
					
					'<iframe allowtransparency="true" frameborder="0" scrolling="no"  src="http://www.facebook.com/plugins/like.php?href=http://www.youtube.com%2Fwatch%3Fv%3D&amp;layout=button_count&amp;show_faces=false&amp;width=450&amp;action=like&amp;font=lucida+grande&amp;colorscheme=dark"'+
					
					'<div><span onclick=slike4("asd");> Go </span> <span onclick=window.close();> Cancel </span></div>';

					
					
					
		var popLoader =  new air.HTMLLoader();

		//'<div><a href="http://twitter.com/share" class="twitter-share-button" data-text="#np" data-count="horizontal" data-via="tuxidomasx">Tweet</a></div>'+
		
		//popLoader.addEventListener(air.Event.LOCATION_CHANGE, function (event){alert(9999);});
		
		var options = new air.NativeWindowInitOptions();
		options.systemChrome = "none";
		options.type = "lightweight";
				
		var windowBounds = new air.Rectangle(nativeWindow.x-50,nativeWindow.y+200,400,100);

		popLoader = air.HTMLLoader.createRootWindow(true, options, false, windowBounds);
		popLoader.placeLoadStringContentInApplicationSandbox = true;
		popLoader.parent.nativeWindow.alwaysInFront = true;
		popLoader.runtimeApplicationDomain = window.runtime.flash.system.ApplicationDomain.currentDomain;

				
		popLoader.loadString(estring);	
					
	/*
	var request = 
		new air.URLRequest("http://m.twitter.com");
	
	var loader = new air.URLLoader();

	loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
	loader.addEventListener(air.Event.COMPLETE, slike3); 
	loader.load(request); 
	*/
}

 
function slike3(event) // if the page asks them to sign in, they arent logged in currently, so we pop up a box. otherwise, we submit the tweet
{
	
	
	var sourcecode = event.target.data; 
	if(sourcecode.indexOf("Please sign in.") > 0) // if its there, we need to prompt them to signin
	{
		air.trace("SLIKE: NOT LOGGED IN-- Opening Login Dialog ");
		//alert("sign in plz");
		
		atoken = squeeze(sourcecode, "authenticity_token\" type=\"hidden\" value=\"", "\" /></div>");

		//alert(atoken);
		var estringDir = air.File.applicationDirectory; 
		estringDir = estringDir.resolvePath("AIRAliases.js"); // huh ahh kick back
		var estringDir2 = air.File.applicationDirectory; 
		estringDir2 = estringDir2.resolvePath("functions.js"); // huh ahh kick back
		var estringDir3 = air.File.applicationDirectory; 
		estringDir3 = estringDir3.resolvePath("style.css"); // huh ahh kick back
		
		//air.trace("ASDASD"+estringDir2.url);
		
				estring = 
					'<script src="'+estringDir.url+'"></script>'+
					'<script src="'+estringDir2.url+'"></script>'+
					'<link rel="stylesheet" type="text/css" href="'+estringDir3.url+'" />'+
					'<div id="tw_cont"><div>Twitter Username: <input id="tusername" type="text" /><br /></div>'+
					'<div>Twitter Password: <input id="tpassword" type="password" /><br /></div>'+
					'<div><span onclick=slike4("'+atoken+'");> Go </span> <span onclick=window.close();> Cancel </span></div>	</div>';

					
		var popLoader =  new air.HTMLLoader();

		
		//popLoader.addEventListener(air.Event.LOCATION_CHANGE, function (event){alert(9999);});
		
		var options = new air.NativeWindowInitOptions();
		options.systemChrome = "none";
		options.type = "lightweight";
				
		var windowBounds = new air.Rectangle(nativeWindow.x-50,nativeWindow.y+200,400,100);

		popLoader = air.HTMLLoader.createRootWindow(true, options, false, windowBounds);
		popLoader.placeLoadStringContentInApplicationSandbox = true;
		popLoader.parent.nativeWindow.alwaysInFront = true;
		popLoader.runtimeApplicationDomain = window.runtime.flash.system.ApplicationDomain.currentDomain;

				
		popLoader.loadString(estring);
		//var request = 	new air.URLRequest("http://m.twitter.com");
		//popLoader.load(request);
	}
	else // otherwise submit the tweet
	{
	
		yt_title = slikepath["title"];
		yt_id = slikepath["id"];
		
		newstatus = "#nowplaying http://youtu.be/"+yt_id+ " "+yt_title;
		
		atoken = squeeze(sourcecode, "authenticity_token\" type=\"hidden\" value=\"", "\" />");
		var request = new air.URLRequest("http://m.twitter.com/status/update");
	request.method = air.URLRequestMethod.POST;
	
	varstring = "source=mobile&status="+newstatus+"&authenticity_token="+escape(atoken)+"&update-submit=update";
	var variables = new air.URLVariables(varstring);
	request.data = variables;

	var loader = new air.URLLoader();

	loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
	loader.addEventListener(air.Event.COMPLETE, slike5); 
	loader.load(request); 
	
		air.trace("SLIKE: LOGGED IN");
	}
	

}

function slike4(tkn)
{

	air.trace("SLIKE: ATTEMPTING LOGIN");
	tunElem = document.getElementById("tusername");
	tpwElem = document.getElementById("tpassword");
	tun = tunElem.value
	tpw = tpwElem.value
	//air.trace("U: " + tunElem.value);
	//air.trace("P: " + tpwElem.value);
	
	var request = new air.URLRequest("http://m.twitter.com/sessions");
	request.method = air.URLRequestMethod.POST;
	
	varstring = "authenticity_token="+tkn+"&session%5Busername_or_email%5D="+tun+
				"&session%5Bpassword%5D="+tpw+
				"&commit=Sign+In";
	var variables = new air.URLVariables(varstring);
	request.data = variables;
	
	var loader = new air.URLLoader();

	loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
	loader.addEventListener(air.Event.COMPLETE, slike5); 
	loader.load(request); 
}

function slike5(event) 
{
	var sourcecode = event.target.data; 
	//air.trace(sourcecode); // test this to see if the login/update was good
	// stop it 5
}


function toWord(tint) // returns hex string'd array representing the int in 32 bytes
{	
	tint =  tint.toString(16);
	while(tint.length < 8)
		tint="0"+tint;

	tbase = ['0x00'];
	
	for(x = 0; x < 8; x=x+2)
	{
		tbase[x/2]='0x'+tint[x]+tint[x+1];
	}
	
	//air.trace("TW: " + tbase);
	
	return tbase;

}

function trim(str)
{
    if(!str || typeof str != 'string')
        return null;

    return str.replace(/^[\s]+/,'').replace(/[\s]+$/,'').replace(/[\s]{2,}/,' ');
}

function loadBuffer(buffer)
{
	var bufferBA = new air.ByteArray();
	
	for(x = 0; x < buffer.length; x++)
	{
		bufferBA[x] = buffer[x];
	}
	
	return bufferBA;
	
}

function ByteArraySearch(needle, haystack, offset)
{
	//air.trace(data.length);
	var window = needle.length;
	var buffer = new air.ByteArray();
	var rvalue = null;
	
	//air.trace(haystack.length - window - 1);
	
	for(x = offset; ((x < haystack.length - window) && (buffer != "mdat") && (buffer != needle)); x++) // we stop the search. after mdat since its all raw media data
	{
		haystack.position = x;
		haystack.readBytes(buffer, 0, window);
	}
	rvalue = x - 1;
	return rvalue;
}

function outFile(fileName, data) // takes a filename and a bytestream
{ 
	var outFile = air.File.desktopDirectory; // dest folder is desktop 
	
	outFile = outFile.resolvePath(fileName);  // name of file to write 
	var outStream = new air.FileStream(); 
	// open output file stream in WRITE mode 
	outStream.open(outFile, air.FileMode.WRITE); 
	// write out the file 
	outStream.writeBytes(data, 0, data.length); 
	// close it 
	outStream.close(); 
	
} 

function parseYTgi(sourcecode, fmt, flag) // they just specify where to start. if its not found, we try lower ones.
{
	//be careful, 
	var fmturls = squeeze(sourcecode, "fmt_url_map", "&")+ "%2C";
	//air.trace("HOOKAH! "+ fmturls);
	fmturlsx = false;
	
	fmturls = unescape(fmturls);
	for(y=fmt; y>0; y--)
	{
		
	
		if(fmturls.indexOf(y+"|http") >= 0)
		{
			fmturlsx = "http" + squeeze(fmturls, y+"|http", ",");
			
			//air.trace(y+"HOOKAH! "+ fmturlsx);

			fmturlsx = fmturlsx.replace(/\|/g, '');
			fmturlsx = fmturlsx.replace(/,/g, '');
			break;
		}
		else
			fmturlsx = false;
	}
	
	
	if(fmturlsx == false)
	{
		air.trace("parseYTgi: can't find good fmt/itag");
		return false;	
	}
	
	air.trace("parseYTgi: FMT: "+y);
	//air.trace("FILEURL: "+fmturlsx+" ||||||");
	
	if(flag)
		return y;
		
	return fmturlsx;
}

function squeeze(source, left, right) // returns text between the first occurance of two strings
{

	if((source.indexOf(left) === false) || (source.indexOf(right) === false))
		return false;
	
	tbegin = source.indexOf(left) + left.length;
	
	tend = source.indexOf(right, tbegin);

	return (source.substring(tbegin, tend)); 

}

function squeezeLast(source, left, right) // returns text between the last occurance of two strings, matching from the right to the left
{

	if((source.lastIndexOf(left) === false) || (source.lastIndexOf(right) === false))
		return false;
	
	tend = source.lastIndexOf(right) - right.length;
	
	tbegin = source.lastIndexOf(left) + left.length;

	return (source.substring(tbegin, tend)); 

}

function ping(info)
{
	var d = new Date();
	//var timestamp;
	//air.trace("TIME ELAPSED: " + timestamp);
	air.trace("TIME ELAPSED: " + Math.ceil(d.getTime() - timestamp) + " INFO: " + info);
	
	timestamp = td.getTime();
	//air.trace("T: " + timestamp );
	
}

function byteSplice(num, endian)
{
	rvalue = [0,0,0,0,0,0,0,0];
	
	for(x=7; x >= 0; x--)
		{		if(num - Math.pow(2, x) >= 0){rvalue[x] = 1;	num = num - Math.pow(2, x);}	}
	
	if(endian)
		rvalue = rvalue.reverse();
	
	return rvalue;
		
}

function keyPressed(hard) // when someone clicks the search button
{
	// HARD specifies the music category: category=Music&
	prequery = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=";
	if(hard)
		prequery = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&category=Music&q=";
	query = document.getElementById("sfield").value;
	if(query == "fb")
		$_TOGGLE_SN = query;
	else if(query == "t")
		$_TOGGLE_SN = query;
	query = query.replace("&", "%26");
	if(query == "")
		query = "youtube";

	var request = 
		new air.URLRequest(prequery+query);
	var loader = new air.URLLoader();
	loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
	//variables.dataFormat = air.URLLoaderDataFormat.VARIABLES; 
	loader.addEventListener(air.Event.COMPLETE, searchCallback); 
	loader.load(request); 
	document.getElementById('sfield').select();

}

function updatePlayer()
{
;
}

function sPLP(tin) // show playlist play button
{
	plpElem = document.getElementById('plp');
	if(tin == true)
	{
		plpElem.setAttribute('class', 'plp_active');
		plpElem.onclick = function () 
		{ 
			mPlayer.play(new Array( mPlayer.getTitle(true), '',  mPlayer.getId(true)));
		}
	}
	else
	{
		plpElem.setAttribute('class', 'plp_normal'); // set the plp back
		plpElem.onclick = null;
	}

}

function setNN(sme_artist, sme_name, sme_id)
{

	sme_artname = sme_artist + sme_name; // heh
	sme_artname = unquoteXml(sme_artname); // might as well clean that shit too
	
	
	player = document.getElementById("player");
	clpn = document.getElementById("clipname");
	clpp = document.getElementById("clipprev");
	
	while(clpn.firstChild)
		clpn.removeChild(clpn.firstChild);
		
	while(clpp.firstChild)
		clpp.removeChild(clpp.firstChild);
		
	clp1 = document.createElement('img');
	clp2 = document.createElement('img');
	clp3 = document.createElement('img');
	clp1.setAttribute("src", "http://img.youtube.com/vi/"+sme_id+"/1.jpg");
	clp2.setAttribute("src", "http://img.youtube.com/vi/"+sme_id+"/2.jpg");
	clp3.setAttribute("src", "http://img.youtube.com/vi/"+sme_id+"/3.jpg");
	
	clp1.setAttribute("class", "clipprev_thumb");
	clp2.setAttribute("class", "clipprev_thumb");
	clp3.setAttribute("class", "clipprev_thumb");
	
	clpp.appendChild(clp1);
	clpp.appendChild(clp2);
	clpp.appendChild(clp3);
	
	tfuncs = function() 
	{
		tval = window.confirm("Watch Video?");
		if(tval)
		{
			try 
			{
				var url = "http://www.youtube.com/watch?v="+sme_id; 
				var urlReq = new air.URLRequest(url); 
				air.navigateToURL(urlReq);
			} 
			catch (e) 
			{
				//whatevs
			}
		}
	};
	
	clpp.onclick = tfuncs;
	
	var cnc_A = document.createElement('span'); // artist
	
	
	sme_alarray = sme_artname.split("-");
	if(sme_alarray.length > 1)
	{
		sme_anleft = sme_alarray[0];
		sme_alarray[0] = "";
		sme_anrest = sme_alarray.join("-");
	
	
		cnc_A.appendChild(document.createTextNode(sme_anleft));
	
	
		//passing keypressed a true value makes it search only the music cat.
		cnc_A.onclick = function(){	document.getElementById("sfield").value=sme_anleft;	keyPressed(true); };
		cnc_A.setAttribute("id", "clipnameArtist");
		cnc_A.setAttribute("name", "clipnameArtist");
		
		var cnc_S = document.createElement('span');
		cnc_S.appendChild(document.createTextNode(sme_anrest));
		clpn.appendChild(cnc_A);
		clpn.appendChild(cnc_S);
	}
	else
	{
		cnc_A.appendChild(document.createTextNode(sme_artname));
		clpn.appendChild(cnc_A);
	}
	
	//var cnc_S = document.createElement('span'); // song
	//cnc_S.appendChild(document.createTextNode(sme_name));
	
	
	//if(sme_name.length > 1) // prevents trailing dash on search result playback
	//	clpn.appendChild(cnc_S);
		

	
}

function changeMode(mode)
{

	if(mode != null)
		$_CONFIG_PLAYLISTMODE = mode;
	else
	{
		if($_CONFIG_PLAYLISTMODE > 0)
			$_CONFIG_PLAYLISTMODE = 0;
		else
			$_CONFIG_PLAYLISTMODE++;
	}
	
	tmpbg = '';
	switch($_CONFIG_PLAYLISTMODE)
	{
		case 0:
		tmpbg = "url('./img/m_mix.png')";
		break;
		
		
		case 1:
		tmpbg = "url('./img/m_fav.png')";
		break;
		
		
		case 2:
		tmpbg = "url('./img/m_HighG.png')";
		break;
		
		default:
		break;
	}
	
	
	modeElem = document.getElementById("mode");
	modeElem.style.backgroundImage=tmpbg;
	//air.trace(modeElem.style.backgroundImage);
}

function togglePlaylist(refresh)
{

	tresults = document.getElementById("results");
	tplaylist = document.getElementById("playlist");
	
	if(tresults.style.display == "none" && refresh == false)
	{
		favorites.save();
		tplaylist.style.display = "none";
		tresults.style.display = "block";
	}
	else
	{

		//refresh list first please
		//dang, see how thorough  i am? i wrote the above line like 3 months ago to remind myself
		favorites.save();
		favorites.load();
		
		//clp1 = document.createElement('img');
		//clp1.setAttribute("class", "clipprev_thumb");
		//tplaylist.appendChild(clp1);
			
		var fplaylist = document.createElement('div'); // container for all results
		fplaylist.setAttribute("id","playlist");
		
		for(x = 0; x < favorites.favPlaylist.length; x++)
		{
			pClass =  (x%2) ? pClass = "playliste" : "playlisto"; // my steez. its tight
			var pItem = document.createElement('div'); // individual result container div
			var pItemid = favorites.favPlaylist[x][1];
			
			
			
			pItem.setAttribute("pl_id",pItemid);
			pItem.setAttribute("id",'pl_'+pItemid);
			pItem.setAttribute("name",'pl_'+pItemid);
			pItem.setAttribute("title",favorites.favPlaylist[x][2]);
			pItem.setAttribute("alt",favorites.favPlaylist[x][2]);
			pItem.setAttribute("class",pClass);
			pItem.setAttribute("index",x);
			
			var stitle = document.createElement('div');
			stitle.setAttribute("class","stitle");
			stitle.appendChild(document.createTextNode(favorites.favPlaylist[x][2]));
		
			pItem.appendChild(stitle);
			
			var pTrash = document.createElement('div'); 
			pTrash.setAttribute("id",'pm_'+pItemid);
			pTrash.setAttribute("title",favorites.favPlaylist[x][1]);
			pTrash.setAttribute("class","hidden");
			pTrash.appendChild(document.createTextNode(""));
			
			var pUp = document.createElement('div'); 
			pUp.setAttribute("id",'up_'+pItemid);
			pUp.setAttribute("class","hidden");
			
			var pDown = document.createElement('div'); 
			pDown.setAttribute("id",'down_'+pItemid);
			pDown.setAttribute("class","hidden");
			
			pItem.onmouseover =  function (event) 
			{
				this.childNodes[3].setAttribute("class","up_visible");	
				this.childNodes[2].setAttribute("class","down_visible");	
				this.childNodes[1].setAttribute("class","trash_visible");	
					
				this.childNodes[3].onclick = function(event) // up
				{
					event.stopPropagation();
					favorites.up(event.currentTarget.parentNode.getAttribute('index'));
					togglePlaylist(true);
					//tnode = event.currentTarget.parentNode;
					//alert(event.currentTarget.parentNode.parentNode);
					//tnode = event.currentTarget.parentNode.parentNode.replaceChild(event.currentTarget.parentNode, event.currentTarget.parentNode.previousSibling);
					//event.currentTarget.parentNode.parentNode.insertBefore(tnode, event.currentTarget.nextSibling);
					//= event.currentTarget.parentNode.nextSibling
					//alert(event.currentTarget.parentNode.nextSibling.id);
					
				}
				
				this.childNodes[2].onclick = function(event) // down
				{
					event.stopPropagation();
					favorites.down(event.currentTarget.parentNode.getAttribute('index'));
					togglePlaylist(true);
					//favorites.down(event.currentTarget.id.substring(3));
				}

				this.childNodes[1].onclick = function(event) // trash
				{
					//favorites.add(new Array(event.currentTarget.id.substring(2), event.currentTarget.title));
					event.stopPropagation(); // badassed -- this stops the event from bubbling up to the play manager. otherwise, the song will play
					//alert(x);
					favorites.remove(event.currentTarget.id.substring(3));
					//alert(event.currentTarget.parentNode.id);
					event.currentTarget.parentNode.style.display = "none";
					//alert(event.currentTarget.style.display);
					favorites.save();
					air.trace("Trash: " + event.currentTarget.getAttribute('title'));
					//var tarray = new Array(event.currentTarget.id.substring(0), event.currentTarget.id.substring(1), event.currentTarget.id.substring(2));	
					
				}
			};
			
			pItem.onmouseout =  function (event) 
			{
				this.childNodes[1].setAttribute("class","hidden");
				this.childNodes[2].setAttribute("class","hidden");
				this.childNodes[3].setAttribute("class","hidden");
			};
			
			pItem.onclick = function(event)
			{ 
				//$_CONFIG_PLAYLISTMODE = 1;
				changeMode(1);
				mPlayer.play(new Array(event.currentTarget.title, '', event.currentTarget.id.substring(3)), true);    
			}; // make it hard yo
		

			pItem.appendChild(pTrash);
			pItem.appendChild(pDown);
			pItem.appendChild(pUp);
			
			fplaylist.appendChild(pItem);
			//air.trace("XXXXXXXXXXXXXXXXXX: " + favorites.favPlaylist[x][1]);
		}
		
		
		
		tplaylist.parentNode.replaceChild(fplaylist, tplaylist);
		
		tplaylist = document.getElementById("playlist");
		tresults.style.display = "none";
		tplaylist.style.display = "block";
		document.getElementById("content").style.display = "block";
		
	}
}

function unquoteXml (xmlStr) 
{
	var result = xmlStr;
	result = result.replace(/&lt;/g, '<');
	result = result.replace(/&gt;/g, '>');
	result = result.replace(/&quot;/g, '\"');
	result = result.replace(/&apos;/g, "'");
	result = result.replace(/&amp;/g, "&");
	return result;
	
}

function quoteXml(xmlStr) 
{
	var result = xmlStr;
	result = result.replace(/</g, '&lt;');
	result = result.replace(/>/g, '&gt;');
	result = result.replace(/"/g, '&quot;');
	result = result.replace(/'/g, "&apos;");
	result = result.replace(/&/g, "&amp;");
	return result;
	
}
function fastRefresh()
{
	main = event.currentTarget.parentNode.parentNode;
	nodes = main.childNodes;
	for(x = 0; x < main.childNodes.length; x++)
	{
		alert(nodes.item(x).id);
	}

}