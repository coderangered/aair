/* default.js- Contains main page functionality-- mostly functions that respond to events */

function playClip(event) 
{

	
 if(event.ready) //  called from the local connection callback from playlist. event in this case should be the MPLAYER object
	{
		air.trace("playClip: Media Player requesting next song... retrieving");
	
		history = false;
		if($_CONFIG_PLAYLISTMODE == 0) // ooohhh, this is MESSY
			history = true;
			
		sme_id = event.getId(history);

		sme_title = event.getTitle(history);
		
		sme_artist = event.getArtist(history);
		
		sme_name = event.getName(history);
		
		//event.ready = false; 
	}

	//alert(event.target.parentNode.id);
	dfuncmp3 = function ()
	{
		// var docsDir = air.File.documentsDirectory;
		// docsDir.browseForSave("Save As");
		var preview = new ytParse(sme_id, sme_title, "mp3", ytCallback);
	}

	dfuncmp4 = function ()
	{
		var preview = new ytParse(sme_id, sme_title, "mp4", ytCallback);
	}

	document.getElementById("mp3").onclick = dfuncmp3;
	document.getElementById("mp4").onclick = dfuncmp4;
	
	setNN(sme_artist, sme_name, sme_id); 
	
	
	document.getElementById("clipinfo").style.display = "block";
	//document.getElementById("plist").style.display = "block";
	document.getElementById("clipextra").style.display = "block";
	
	tyt_id = sme_id;
		
		var request = new air.URLRequest("http://www.youtube.com/get_video_info?el=&video_id="+
		tyt_id+"&asv=3&hl=en_US");
		var loader = new air.URLLoader();
		
		air.trace("INFO URL: http://www.youtube.com/get_video_info?el=&video_id="+
			tyt_id+"&asv=3&hl=en_US");
			
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		//variables.dataFormat = air.URLLoaderDataFormat.VARIABLES; 
		loader.addEventListener(air.Event.COMPLETE, playCliploader); 
		loader.load(request); 
		//air.trace("ppp:"+extraContent.playlistMix);
		
		//like button going here
		/*
		tlike = document.getElementById("like");
		while(tlike.firstChild)
			tlike.removeChild(tlike.firstChild);
		*/	
		
		//slikepath["title"] = sme_title;
		//slikepath["id"] = tyt_id;
		
		fblike = function ()
		{
			window.open("http://www.facebook.com/sharer.php?u=http://aair.com/"+tyt_id+"&t="+sme_title, 'popupwindow', 'width=500,height=350,scrollbars=false,resizable=false'); 
			return false;
		}
		
		twlike = function ()
		{
			window.open("http://twitter.com/share?url=http%3A%2F%2Faair.com/"+tyt_id+"&amp;via=twitterapi&text=%23np%20"+sme_title , 'popupwindow', 'width=500,height=350,scrollbars=false,resizable=false'); 
			return false;
		}

		
		tlike = document.getElementById("like");
		while(tlike.firstChild)
			tlike.removeChild(tlike.firstChild);
		
		/*
		if($_TOGGLE_SN == "t")
		{
		*/
		var like_full = document.createElement('div'); // like div
		var like_facebook = document.createElement('div'); // like div
		var like_twitter = document.createElement('div'); // like div
		
		//functions
		like_facebook.onclick = fblike;
		like_twitter.onclick = twlike;
		

		like_full.setAttribute("id", "like_full");
		like_full.setAttribute("name", "like_full");
		
		like_facebook.setAttribute("id", "like_fb");
		like_facebook.setAttribute("name", "like_fb");
		
		like_twitter.setAttribute("id", "like_tw");
		like_twitter.setAttribute("name", "like_tw");

		
		like_full.appendChild(like_facebook);
		like_full.appendChild(like_twitter);
		
		tlike.appendChild(like_full);
		/*
		}
		else
		{
			var like_f = document.createElement('iframe'); // like iframe
			like_f.setAttribute("src", "http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D"+tyt_id+"&amp;layout=button_count&amp;show_faces=false&amp;width=450&amp;action=like&amp;font=lucida+grande&amp;colorscheme=dark");
			
					like_f.setAttribute("id", "like_fb");
		like_f.setAttribute("name", "like_fb");
			like_f.setAttribute("scrolling", "no");
			like_f.setAttribute("frameborder", "0");
			like_f.setAttribute("allowTransparency", "true");
			like_f.setAttribute("allowTransparency", "true");
			tlike.appendChild(like_f);
		}
		*/
		sPLP(false);
		


		if($_CONFIG_PLAYLISTMODE < 2 )
		{
			;
		}
		//else
		{
			extraContent.go(sme_title, exCallback);
		}
		air.trace("sme:"+sme_artist);
		//air.trace("exc:"+extraContent.contributorName);
		
		
		//refreshNN(); // sets up name for "Next up" part
		
		
	//	air.trace("exc:"+extraContent.playlistMix);
		//var extraContent = new extraCon(sme_title, exCallback);
	}

function playCliploader(event) // this is where we send the song url to the flash player
{	
	// alert(event.target);
	// good a time as any to force garbage collection
	air.System.gc();

	var sourcecode = event.target.data;
				
				
						
	/****************************************
	we can set the quality of playing files here. 
	instead of 34 for medium quality, we can do 6 for lower quality)
	ydl = parseYTgi(sourcecode, 34);
	ydl = parseYTgi(sourcecode, 6);
	
	if you hold your mouse over the Now-playing box for a few seconds 
	without clicking, show the "next up" song, and allow them to "skip it" to display the 
	next one.
	
	help file is a grahpic displayed beside the player pointing to items
	
	http://www.reddit.com/r/listentothis/.rss
	&output=rss for google.
	&format=rss for bing.
	
	also find a way to include a tweet feed from you?
	
	to obtain playlist redundancy, store the playlist for each artist 
	result in the cloud (code snippet-- a longer twitter) then search 
	twitter for the playlist. the metadata should contain the url to the backedup joint
	
	for search, divide the search bar in half vertically. 
	the left will be artist and song. the right will be for lyrics.
	when you click on one, the bar slides over the other end, extending to
	fill the full bar
	
	also, implement a small delay after next() in case they hit it again.
	
	also, let users sync with other users by listening to simultaneous playlists.
	either person can skip the song.
	multiple people can watch/listen
	
	http://m.bing.com for a lighter footprint and easier parsing. cheers
	 
	
	pixelbender for effects for flex app
	
	for people who are listening to someone else's playlist, they get that persons live tweets
	so the playlist owner kinda become the DJ.
	
	annotations passed with the playlist lets the owner tell the listner something while they listen.
	they can also specify a starting and ending position.
	
	no website. but you can "host" your website by including html or decryption/decoding routines for 
	hidden html content online
	
	i'm increasingly considering building the playlist functionality into both products instead of just this app
	
	use url encoding to store the images for people's themes?
	
	SESSISMIC LOOK
	
	when the user requests a song, it deletes the playlist
	
	1 minute twitter api polling? 
	api rate limit is 150 / hr for apps and higher for individual users (per ip)
	
	"float" songs to other people's twitters. it automatically shows up in their playlist with a popup that its "from xyz".
auto gets missed ones for past day when turned on.	feature can be disabled.

have way to email itself to people at user's request. auto distribution

http://www.incorporate.com/incorporate_now.html

add to this app by allowing it to detect what song a radio is playing, and play that same song.
	****************************************/
	
		ydl = parseYTgi(sourcecode, 34);
				
				
				air.trace(fmturlsx);
				//ydl = ydl.replace('%3D', '=');
				
				smilfile = '<?xml version="1.0" encoding="utf-8"?>'+
				'\n<!DOCTYPE smil PUBLIC "-//W3C//DTD SMIL 2.0//EN"'+
				'\n"http://www.w3.org/2001/SMIL20/SMIL20.dtd">'+
				'\n<smil xmlns="http://www.w3.org/2001/SMIL20/Language">'+
				'\n<body>\n<switch>\n<video src="'+ydl+'" />'+
				'\n</switch>\n</body>\n</smil>';
				
				var outFile = air.File.applicationStorageDirectory;
				//applicationStorageDirectory
				
				outFile = outFile.resolvePath("flvplayer.smil");  // name of file to write 
				var outStream = new air.FileStream(); 
				// open output file stream in WRITE mode 
				outStream.open(outFile, air.FileMode.WRITE); 
				// write out the file 
				outStream.writeUTFBytes(smilfile); 
				// close it 
				outStream.close();  
				
				var inFile = air.File.applicationDirectory; //
				inFile = inFile.resolvePath("flvplayer.swf");  // name of file to write 
				
				
				//var newLoader;
				//vertOffsetConst = 161;
				vertOffset = document.getElementById("results").offsetHeight + vertOffsetConst;

				estring = '<embed style="background-color:#3B5997; height: 35px;" src="'+inFile.url+'" name="flvplayer" id="flvplayer" autoplay="true" '+
					'salign="lt" wmode="transparent" width="299" height="25"'+
					'flashvars="tturl='+outFile.nativePath+'" />';
					
	
			player = document.getElementById("player");
			player.innerHTML = estring;
			player.style.height="25px";
					
			//air.trace(player.innerHTML);

}






// old = paD_R3u6hxo
// new = h9n9gJ2MHZk

//var mp4file = new ytParse("iuycRCDD90w", "mp4", ytCallback);


air.trace("Running");


