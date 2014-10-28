/* callbacks.js- Callback logic.  */

function ytCallback(ytGeneric) // this gets called while its downloading, and when it finishes loading and processing. i'm using some kind of double parameter packing. listening to wiz 
{

	if (ytGeneric=="Are You Ready For a New Challenger!?!") // create DOM structure for dload object
	{
	
	if(downloadMan.indexOf(this.yt_id) >= 0)
		{
			air.trace("ytCallback: Can't download a file thats already in the queue");
			return false;
		}
		
		air.trace("ytCallback: Adding to download Queue: " + this.yt_id);
		//make sure its not already there. we dont need repeat downloads



		var dloadimg = document.createElement('div'); // little square progress indicator
		dloadimg.setAttribute("class","percentNone");
		dloadimg.setAttribute("id","dl_"+this.yt_id);
		
		var dloadobj = document.createElement('div'); // the main dload DOM object
		dloadobj.setAttribute("class","dobject");
		dloadobj.onclick = function(){alert(1);};
		dloadobj.appendChild(dloadimg);
		
		dloadContainer = document.getElementById("progress"); // we put it in progress
		dloadContainer.appendChild(dloadobj);
		
		downloadMan.push(this.yt_id);
		
		return true;
	}
	
	else if (ytGeneric && (dloadimg = document.getElementById("dl_"+this.yt_id)))
	{
	//air.trace(":CN: ");
			percent = parseInt((ytGeneric.bytesLoaded / ytGeneric.bytesTotal)* 100);
			dloadimg.innerHTML = percent; // yea i cheated. so what
			
			if( percent >= 98){
				//air.trace("PERCENT: 100"); 
				dloadimg.setAttribute("class","percentDone");		
			}
			else if( percent > 75){
				//air.trace("PERCENT: 75"); 
				dloadimg.setAttribute("class","percentTre");
				}
			else if( percent > 50){
				//air.trace("PERCENT: 50"); 
				dloadimg.setAttribute("class","percentHalf");
				}
			else if(percent > 25){
				//air.trace("PERCENT: 25"); 
				dloadimg.setAttribute("class","percentQuarter");
				}
			else 
				;
			
	
		//document.getElementById("progress").firstChild.nodeValue = percent + '%';
	}

	else
	{
		this.process();
		air.trace("ytCallback: "+this.ready);
		this.save(this.title);
		
		air.trace("ytCallback: Removing from download Queue: " + this.yt_id);
		downloadMan.splice(downloadMan.indexOf(this.yt_id), 1);
		
		document.getElementById("progress").removeChild(document.getElementById("dl_"+this.yt_id).parentNode); // steez!!!
		
	}
	
}

function exCallback() // this gets called when it finishes loading and processing media
{

	//***************************  stubhub: http://www.stubhub.com/listingCatalog/select/?wt=atom&rows=55&q=justin	***************************//

	air.trace("exCallback: "+this.contributorName);
	
	if($_CONFIG_PLAYLISTMODE == 0) // global vars to the rescue
		if(this.contributorName.length > 0) // DO IT LIVE
			this.getPlaylist(playListCallback);

}

function playListCallback() // this gets called when it finishes loading and processing playlist from disco
{


	if($_CONFIG_PLAYLISTMODE == 0) 
		mPlayerPlaylist = this.mixList;
	else
		mPlayerPlaylist = favorites.favPlaylist; // for 1 and 3
		
	air.trace("playListCallback: Size= "+mPlayerPlaylist.length);
	
	//if(this.mixList.length > 1)
	//	mPlayer.setPlaylist(this.mixList, "a");

	if(this.allList.length > 1)
		mPlayer.setPlaylist(this.allList, "r");
	
	else
	{
		air.trace("playListCallback: Size too small (<1). Bounce.)");
	}
	
	if(document.getElementById("next"))
	{
		air.trace("playListCallback: Blinkley lights ON");
		document.getElementById("next").setAttribute("name","nextH");
		document.getElementById("next").setAttribute("id","nextH");
	}



}

function searchCallback(event) // this gets called when you search
{

	//alert(event.target.data);
	var jData = eval('(' + event.target.data + ')'); // *close enough pose*
		//air.trace("YAAAAAAAAAARRRRRRRRRRRR: " + event.target.data);
	tresults = document.getElementById("results");
	
	var fresults = document.createElement('div'); // container for all results
	fresults.setAttribute("id","results");

//if (jData.data.items.length <= 0)
	if(jData.data.totalItems == 0)
	{
		return 0;
	}
	
	
	for(x = 0; x < jData.data.items.length; x++)
	{
		
		sresultClass =  (x%2) ? sresultClass = "sresulte" : "sresulto"; // my steez. its tight
		
		sresultsName = jData.data.items[x].title;
		
		if(sresultsName.length > 40)
			sresultsName = sresultsName.substring(0, 40)+"...";
		
		var sresult = document.createElement('div'); // individual result container div
		var sresultid = jData.data.items[x].id;
		
		//air.trace("alert- x: " + x + " id: " + sresultid);
		
		
		sresult.setAttribute("yt_id",sresultid);
		sresult.setAttribute("id",'d_'+sresultid);
		sresult.setAttribute("name",'d_'+sresultid);
		sresult.setAttribute("title",jData.data.items[x].title);
		sresult.setAttribute("alt",jData.data.items[x].title);
		sresult.setAttribute("class",sresultClass);
		
		var splaylist = document.createElement('div'); 
		splaylist.setAttribute("id",'p_'+sresultid);
		
		splaylist.setAttribute("title",jData.data.items[x].title);
		
		if (favorites.contains(sresultid))
			splaylist.setAttribute("class","playlist_added");
		else
			splaylist.setAttribute("class","playlist_hidden");
			
		splaylist.appendChild(document.createTextNode(""));
		
		
		
		sresult.onmouseover =  function (event) 
		{
			if (favorites.contains(event.currentTarget.id.substring(2)))
				document.getElementById('p_'+event.currentTarget.id.substring(2)).setAttribute("class","playlist_added");
			else
				document.getElementById('p_'+event.currentTarget.id.substring(2)).setAttribute("class","playlist_visible");
			
			
			
			document.getElementById('p_'+event.currentTarget.id.substring(2)).onclick = function(event)
			{
				event.stopPropagation(); // badassed -- this stops the event from bubbling up to the play manager. otherwise, the song will play
				favorites.add(new Array("", event.currentTarget.id.substring(2), event.currentTarget.title));
				//air.trace("MMMMMMMMMMMM: " + event.currentTarget.getAttribute('title'));
				//var tarray = new Array(event.currentTarget.id.substring(0), event.currentTarget.id.substring(1), event.currentTarget.id.substring(2));	
			}
		};
		
		sresult.onmouseout =  function (event) 
		{
			if (favorites.contains(event.currentTarget.id.substring(2)))
				document.getElementById('p_'+event.currentTarget.id.substring(2)).setAttribute("class","playlist_added");
			else
				document.getElementById('p_'+event.currentTarget.id.substring(2)).setAttribute("class","playlist_hidden");
				
		};
		


		
		sresult.onclick = function(event)
		{ 
			//$_CONFIG_PLAYLISTMODE = 0;
			changeMode(0);
			mPlayer.play(new Array(event.currentTarget.title, '', event.currentTarget.id.substring(2)), true);    
		}; // make it hard yo
		

		var stitle = document.createElement('div');
		stitle.setAttribute("class","stitle");
		stitle.appendChild(document.createTextNode(jData.data.items[x].title));
		
		
		var sduration = document.createElement('span');
		sduration.setAttribute("class","sduration");
		sduration.appendChild(document.createTextNode('.:'+parseInt(jData.data.items[x].duration / 60)+'m'+(jData.data.items[x].duration % 60)+'s' ));
		
		sresult.appendChild(stitle);
		sresult.appendChild(sduration);
		sresult.appendChild(splaylist);
		
		fresults.appendChild(sresult);
		
	}

	
	tresults.parentNode.replaceChild(fresults, tresults);
	
	document.getElementById("playlist").style.display = "none";
	document.getElementById("content").style.display = "block"; // make sure this is shown. we auto-hide it in css
	
	//alert(jData.data.items[1].content["1"]);
	updatePlayer();
	
	
					
}


function favCallback(event) // this gets called when you search
{
	
}