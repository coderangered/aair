/* default_classes.js- Contains object logic */
/*******************************************************************
##    ## ######## ########     ###    ########   ######  ######## 
 ##  ##     ##    ##     ##   ## ##   ##     ## ##    ## ##       
  ####      ##    ##     ##  ##   ##  ##     ## ##       ##       
   ##       ##    ########  ##     ## ########   ######  ######   
   ##       ##    ##        ######### ##   ##         ## ##       
   ##       ##    ##        ##     ## ##    ##  ##    ## ##       
   ##       ##    ##        ##     ## ##     ##  ######  ######## 
http://www.network-science.de/ascii/
*/
function ytParse(yt_id, title, type, ytCallback) // despite the name, this is the download object. these fill an array that is consumed by the download manager
{
//alert(yt_id);
	if(!yt_id)
		return 0;
	
	var me = this;
	this.yt_id = yt_id;
	this.type = type;
	this.cb = ytCallback; // universal callback
	
	this.url = "http://www.youtube.com/get_video_info?el=&video_id="+yt_id;
	this.ready = false;
	this.rawdata = new air.ByteArray();
	this.rawaudio_data = new air.ByteArray();
	this.rawaudio_ptrs = new Array();
	this.title = title;
	this.fmt = 0;
	
	this.save = function(fname)
	{
		if(fname == "")
			fname = "Untitled-1";
		else
			fname = me.title;
	
	fname = fname.replace(/\x3A|\x3F|\x3C|\x3E|\x5C|\x2F|\x22|\x2A|\x7C|\x2E|\x27|\x60/g, '');

	
		outFile(fname+"."+me.type, me.rawdata);
	}
	
	
	this.load = function() // fukkin callbacks. get source
	{
		var request = new air.URLRequest(me.url);
		air.trace("ytParse->load: url " + me.url);
		var loader = new air.URLLoader();
	
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		//variables.dataFormat = air.URLLoaderDataFormat.VARIABLES; 
		loader.addEventListener(air.Event.COMPLETE, me.load2); 
		loader.load(request); 
	};	
	
	this.load2 = function(event) // parse source to extract the url of the locaton of the download
	{

		var sourcecode = event.target.data; // DO IT LIVE
		//var sourcecode = "doitlive"; // // NOT LIVE
		ydl="";
		sfmt = 0;
		if(me.type == "mp4")
		{
			sfmt = parseYTgi(sourcecode, 35, true); // includes 35, 34, and 18
			ydl = parseYTgi(sourcecode, sfmt); // start high for downloads
			if(sfmt == 5 || sfmt == 6) // hot fix
				me.type = "mp3";
		}
		else
		{
			sfmt = parseYTgi(sourcecode, 6, true);
			ydl = parseYTgi(sourcecode, sfmt); // start high for downloads
		}
			
		me.fmt = sfmt;

		//air.trace("FMT: " + sfmt);
		//for testing, we use a test file
	
		// var request = new air.URLRequest("elevator.flv"); // NOT LIVE
		var request = new air.URLRequest(ydl); // DO IT LIVE
		request.useCache = true;
		request.cacheResponse = true;
		var loader = new air.URLLoader();
		
		loader.dataFormat  = air.URLLoaderDataFormat.BINARY;
		loader.addEventListener(air.ProgressEvent.PROGRESS, function(event){ me.cb(event);}); // a hook back out to the main 
		loader.addEventListener(air.Event.COMPLETE, me.load3);
		
		
		//delete this later if you dont need it. its messy -- thank you, past nick. tho in the future, you should make messages larger so as to make them easier to see.**********

		if(me.cb("Are You Ready For a New Challenger!?!", me.yt_id)) 
				loader.load(request); 
	};
	
	this.load3 = function(event)
	{
		me.ready=true;
		me.rawdata = event.target.data;
		air.trace("loaded");
		me.cb();
	};
	
	this.process = function()
	{
		if (me.type == "mp3")
			me.processMP3();
		else
		{
			if(me.fmt == 18)
				me.processMP4();	
			else
				me.processMP4flv();
		}
			
		
	}
	
	this.processMP3 = function()
	{

	    air.trace("START: processMP3()"); 

		tvid = me.rawdata; 
		tend = tvid.length;
		var tba = new air.ByteArray();
		tvid.position = 13;

		var tagtype;

		tcount = 0;
		var mp3file = new air.ByteArray();
		//var mp3file_lp = 0;
		
		while (tagtype = tvid.readByte())
		{
			
			tba.position=0;
			tvid.readBytes(tba, 1, 3); // offest 1 to read it as a 32 bit integer (its 24 bit)
			tba.position=0;
			tagdatalen = tba.readInt();
			
			//air.trace(tagdatalen);
			// 11 bytes is the distance from the datasize to the data itself.: timestamp (3), timestampext(1), streamid(3), prevtaglen(4)
			nexttag = tvid.position + 11 + tagdatalen; 
			
			if (tagtype == 8) // audio tag
			{
				tcount++;
				
				// skip forward to the data section. 
				//the 7 comes from timestamp (3) + timestampext(1) + streamid(3)
				// skipping to the next tag includes the tagdatalen as well as 4 bytes for the end-of-tag size, which is where 11 is from
				tvid.position += 7; // this should be right. dont fuck with it
				
				// this reads the first audio 1 byte header. after this, the audiodata starts
				
				
				tvid.readByte();
				//tvid.readByte(); // move up one more byte for aac (it has a 1 byte header of its own before its real data) only for aac mp4 files tho. dont need this for mp3s
				tba.position=0; 
				
				size = (nexttag - 4) - tvid.position;	
				//air.trace("POSITION: "+tvid.position.toString(16)+ " NEXTTAG: "+nexttag+" SIZE: "+size+" TCOUNT: "+tcount ); 
				
				tvid.readBytes(mp3file, mp3file.length, (nexttag - 4) - tvid.position);

				// at this point, we should be right at the start of the mp3 header. nexttgag - thisposition = data
				tba.position=0; 
				
				//tvid.readBytes(mp3file, mp3file.length, (nexttag - 4) - tvid.position );
				
			}
			
			tvid.position = nexttag;
			
			//air.trace(tagtype);
			
			if(tvid.position + 8 >= tvid.length)
				break;

		}
		
		me.rawdata = mp3file;
		air.trace("END: processMP3()"); 
		//end of the PROCESSMP3 function 
	}
	
	this.processMP4flv = function()
	{
		air.trace("processMP4flv: extracting mp4 from flv container"); 
		tvid = me.rawdata; 
		tend = tvid.length;
		var tba = new air.ByteArray();
		tvid.position = 13;

		var tagtype;

		tcount = 0;
		var aacdata = new air.ByteArray();
		var asc = new Array();
		mp4Duration = 0;
		//var mp3file_lp = 0;
		
		var stsz_samplearray = new Array();
		yum = 0;
		while (tagtype = tvid.readByte())
		{
			
			tba.position=0;
			tvid.readBytes(tba, 1, 3); // offest 1 to read it as a 32 bit integer (its 24 bit)
			tba.position=0;
			tagdatalen = tba.readInt();
			
		//air.trace(tagdatalen);
		// 11 bytes is the distance from the datasize to the data itself.: timestamp (3), timestampext(1), streamid(3), prevtaglen(4)
			nexttag = tvid.position + 11 + tagdatalen; 
			//air.trace(tvid.position);
			
			if (tagtype == 8) // audio tag
			{
				/*
				if(yum == 3)
					air.trace("LOL: "+tvid.position);
				yum++;
				*/
				// skip forward to the data section. 
				//the 3 comes from timestamp (3) + timestampext(1) + streamid(3)
				// skipping to the next tag includes the tagdatalen as well as 4 bytes for the end-of-tag size, which is where 11 is from
				
				
				tba.position=0;
				tvid.readBytes(tba, 1, 3); // offest 1 to read it as a 32 bit integer (its 24 bit)
				tba.position=0;
				mp4Duration = tba.readInt();

				tvid.position += 4; // this should be right. dont fuck with it
				
				// this reads the first audio 1 byte header. after this, the audiodata starts. unless mp4, then its an extra byte
				
				
				tvid.readByte();
				ttype = tvid.readByte();  // extra byte for aac/mp4
				
				if (ttype == 0)	 // audiospecific config should come first. hopefully.
				{
					air.trace("FLV ASC:" + tvid.position);
					asc[0] = tvid.readByte();
					asc[1] = tvid.readByte();
					air.trace("ASC:" + asc);
				}
				else
				{
					
					tba.position=0; 
					
					size = (nexttag - 4) - tvid.position;	
					//air.trace("POSITION: "+tvid.position.toString(16)+ " NEXTTAG: "+nexttag+" SIZE: "+size+" TCOUNT: "+tcount ); 
					
					//air.trace("MMK: "+tvid.readByte());
					//tvid.position = tvid.position-1;
					
					framesize = (nexttag - 4) - tvid.position;
					
					
					if(framesize != 0)
					{
					
						tvid.readBytes(aacdata, aacdata.length, framesize);
						stsz_samplearray[tcount] = framesize; // get size of that sample
						tcount++;
					}
					
					
					// at this point, we should be right at the start of the header. nexttgag - thisposition = data
					tba.position=0; 
					
					//tvid.readBytes(mp3file, mp3file.length, (nexttag - 4) - tvid.position );
					
					
				}
				
				
			}
			

			tvid.position = nexttag;
			
			//air.trace(tagtype);
			
			if(tvid.position + 8 >= tvid.length)
				break;

		}
		
		// stsc_chunkcount = how many chunks there are. 
		// each chunk contains 22 samples
		// each sample can vary in size
		
		stsc_chunkcount = Math.floor(stsz_samplearray.length/22); 
		if(stsz_samplearray.length/22 != stsc_chunkcount)
			stsc_chunkcount++;
		air.trace("COUUNT: " + stsc_chunkcount);
		
		me.generateMP4(aacdata, stsc_chunkcount, stsz_samplearray, mp4Duration, asc);
		
		//outFile("prochunk.flv", aacdata);
		//outFile("rawchunk.flv", me.rawdata);
		// return 0; // NOT LIVE
		
		air.trace("processMP4flv: done"); 
	}
	
	this.generateMP4 = function(aacdata, stsc_chunkcount, stsz_samplearray, mp4Duration, asc)
	{
	

		// okay. showtime
		
		air.trace("generateMP4: start"); 		

		var temparray = new air.ByteArray();
		var buffer = new Array();
		var mp4file = new air.ByteArray();	
		
		// take the mp4 template 
			var file = air.File.applicationDirectory.resolvePath( 'ricky.dat' );
			var stream = new air.FileStream();
			  
            // Open the stream for writing
            // Write the name value to the file using system encoding
            // Close the stream 
            stream.open( file, air.FileMode.READ );
            stream.readBytes( mp4file, 0, 0 );
            stream.close();
			
		// and tack on the chunk info and data
		// it goes: tarray = 0, load tarray with box data (no size). write size to main box. write tarray to main box. write main box to file.
		

		//*******************************************************************************MP4: STTS- FB
		
		var stts = new air.ByteArray();
		
		temparray.length = 0;
		buffer.length = 0;
		
		// oh man, this is niiiice
		
		//air.trace("stts sampsize: "+stsz_samplearray.length ) ;
		//air.trace("stts sampsizeHEX: "+toWord(stsz_samplearray.length) ) ;
		buffer = buffer.concat(
				[
					0x00,0x00,0x00,0x00, // FB header flags
					0x00,0x00,0x00,0x01 // 1, number of entries in the following table
				]);
		buffer = buffer.concat(toWord(stsz_samplearray.length)); // number of frames
		buffer = buffer.concat(
				[
					0x00,0x00,0x04,0x00 // 400, sample duration (1024)
				]);
		
		bufferBA = loadBuffer(buffer); // it needs to be a byte array to insert it into the bytearraystream
		
		temparray.writeInt(buffer.length+8); // 8 = 4 for the size + 4 for the box tag
		temparray.writeUTFBytes("stts");
		temparray.writeBytes(bufferBA,0,0);
		
		stts.writeBytes(temparray, 0, 0);
		
		mp4file.position = mp4file.length; // dont forget to put this there
		mp4file.writeBytes(stts, 0, 0);
		

		//*******************************************************************************MP4: STSC- FB
		var stsc = new air.ByteArray();
		
		temparray.length = 0;
		buffer.length = 0;
		
		buffer = buffer.concat(
				[
					0x00,0x00,0x00,0x00, // FB header flags
					0x00,0x00,0x00,0x02, // 2, number of chunk configs (1 for most of them, and 1 for the oddballs)
					0x00,0x00,0x00,0x01, // id of first chunk of consecutive chunks that have this config
					0x00,0x00,0x00,0x16, // samples/frames per chunk/block. 16h/22d for normal ones
					0x00,0x00,0x00,0x01  // sample description index (id of the containing sample box)
				]);
		
		buffer = buffer.concat(toWord(stsc_chunkcount)); // last chunk group (it will be the odd one)
		buffer = buffer.concat(toWord((stsc_chunkcount * 22) - stsz_samplearray.length)); // odd frames
		buffer = buffer.concat(
				[
					0x00,0x00,0x00,0x01
				]);
		bufferBA = loadBuffer(buffer); // it needs to be a byte array to insert it into the bytearraystream
		
		temparray.writeInt(buffer.length+8); // 8 = 4 for the size + 4 for the box tag
		temparray.writeUTFBytes("stsc");
		temparray.writeBytes(bufferBA,0,0);
		
		stsc.writeBytes(temparray, 0, 0);
		
		mp4file.position = mp4file.length; // dont forget to put this there
		mp4file.writeBytes(stsc, 0, 0);
		

		//*******************************************************************************MP4: STSZ- FB
		var stsz = new air.ByteArray();
		
		temparray.length = 0;
		buffer.length = 0;
		buffer = buffer.concat(
				[
					0x00,0x00,0x00,0x00, // FB header flags
					0x00,0x00,0x00,0x00 // sample size. a value of 0 means that the samples have different sizes
				]);
		buffer = buffer.concat(toWord(stsz_samplearray.length)); // number of frames
		
		for(w=0; w < stsz_samplearray.length; w++)
		{
			tbuff = toWord(stsz_samplearray[w]);
			for(tbx = 0; tbx < 4; tbx++)
				buffer.push(tbuff[tbx]);
		}
			
		// air.trace("STSZ: "+ stsz_samplearray.length+ " 2: "+ toWord(stsz_samplearray[210] ));	
		
		bufferBA = loadBuffer(buffer); // it needs to be a byte array to insert it into the bytearraystream
		
		
		temparray.writeInt(buffer.length+8); // 8 = 4 for the size + 4 for the box tag
		temparray.writeUTFBytes("stsz");
		temparray.writeBytes(bufferBA,0,0);
		
		stsz.writeBytes(temparray, 0, 0);
		
		mp4file.position = mp4file.length; // dont forget to put this there
		mp4file.writeBytes(stsz, 0, 0);
		

		//*******************************************************************************MP4: STCO- FB
		var stco = new air.ByteArray();
		
		temparray.length = 0;
		buffer.length = 0;
		buffer = buffer.concat(
				[
					0x00,0x00,0x00,0x00
				]);
		buffer = buffer.concat(toWord(stsc_chunkcount)); // total chunk groups (including last one i think)

		
		
		// to get the magical offset, we need to calculate the size of the file up to the very start of mdat
		// + size of existing file (all other boxes) 
		// + size of this file (8 for FB flags and chunk group total, some for the chunks, 8 for FB tag name and size)
		// + size and tag name for mdat box. data starts immediatley after.
		magicalOffset = mp4file.length + (8 + (stsc_chunkcount*4) + 8) + 8;
		
		sampleIndex = 0;
		chunkSize = 0;
		for(r=0; r < stsc_chunkcount; r++)
		{
			// air.trace("MO: " + magicalOffset+chunkSize);
			buffer = buffer.concat(toWord(magicalOffset+chunkSize));
			
			for(q=0; ((q < 22) && (sampleIndex < stsz_samplearray.length)); q++)
			{
				chunkSize += stsz_samplearray[sampleIndex];
				sampleIndex++;
			}
			
			
		}
		
		bufferBA = loadBuffer(buffer); // it needs to be a byte array to insert it into the bytearraystream
		temparray.writeInt(buffer.length+8); // 8 = 4 for the size + 4 for the box tag
		temparray.writeUTFBytes("stco");
		temparray.writeBytes(bufferBA,0,0);
		
		stco.writeBytes(temparray, 0, 0);
		
		mp4file.position = mp4file.length; // dont forget to put this there
		mp4file.writeBytes(stco, 0, 0);
		

		//*******************************************************************************MP4: MDAT- B
		mdat = new air.ByteArray();
		temparray.length = 0;

		temparray.writeInt(aacdata.length+8); // 8 = 4 for the size + 4 for the box tag
		temparray.writeUTFBytes("mdat");
		temparray.writeBytes(aacdata,0,0);
		
		mdat.writeBytes(temparray, 0, 0);
		
		mp4file.position = mp4file.length; // dont forget to put this there
		mdatbox = mp4file.position;
		mp4file.writeBytes(mdat, 0, 0);
		

		//*******************************************************************************MP4: EXTRA

		// duration #1: 3Ch = 60d
		// timescale of flv is 1000. so (last time / 1000) * timescale of mp4 template = our new duration
		
		sampfreqIndex = byteSplice(asc[0], 1).slice(4,8).join(''); // my steez. it is strong. splice & slice
		if(sampfreqIndex == "0010")
		{
			sampfreq = 44100;
			sampExt = 2890137600;
		}
		else
		{
			sampfreq = 22050;
			sampExt = 1445068800;
		}
		
		//if(sampfreqIndex == "1110")
		//	sampfreq = 22050;
		
		air.trace("SAMPFREQ: " + sampfreqIndex);	
		
		mp4file.position = 56; //60;
		mp4file.writeInt(Math.floor(1000));
		mp4file.writeInt(Math.floor(mp4Duration)); 

		
		// duration #2: C9h = 201d
		mp4file.position = 201;
		mp4file.writeInt(Math.floor(mp4Duration));
		
		// rate #1: 125h = 293d // set rate to sampfreq: 
		mp4file.position = 293;
		mp4file.writeInt(sampfreq);
		
		// duration #3: 129h = 297d
		mp4file.position = 297;
		mp4file.writeInt(Math.floor(mp4Duration*.001*sampfreq));
		
		// rate #2: 1e7h = 487d // set rate to sampfreq: x56220000 (yes, it is flipflopped from the otherone)
		mp4file.position = 487;
		mp4file.writeInt(sampExt); // dont do this at home, kids
		
		// sample freq: 20Dh = 525d
		mp4file.position = 525;
		mp4file.writeByte(asc[0]); // audiospecific config from flv
		mp4file.writeByte(asc[1]);
		
		mp4fileString = mp4file.toString();
		//mdatLoc = mp4fileString.indexOf("mdat");
		
		//mdatLoc = mp4file.lastIndexOf("mdat");

		//mp4file.writeInt(mdatLoc - mp4fileString.indexOf("moov")+1);
		mp4file.position =  mp4fileString.indexOf("moov") - 4;
		mp4file.writeInt(mdatbox - mp4file.position);
		
		mp4file.position =  mp4fileString.indexOf("trak") - 4;
		mp4file.writeInt(mdatbox - mp4file.position);
		
		mp4file.position =  mp4fileString.indexOf("mdia") - 4;
		mp4file.writeInt(mdatbox - mp4file.position);
		
		mp4file.position =  mp4fileString.indexOf("minf") - 4;
		mp4file.writeInt(mdatbox - mp4file.position);
		
		mp4file.position =  mp4fileString.indexOf("stbl") - 4;
		mp4file.writeInt(mdatbox - mp4file.position);
		
		
		//air.trace("D: " + mp4Duration);
		

		//outFile("debug.mp4", mp4file);
		air.trace("generateMP4: done"); 

		me.rawdata = mp4file;

	}
	
	this.processMP4 = function()
	{

		air.trace("processMP4(fmt18): start"); 
		var buffer = new air.ByteArray();
		
		//1- grab samples from audio track from offsets and sizes in stco and stsz
		
		// CHUNK OFFSET TABLE
		air.trace("MP4: Chunk offsets");
		stco = ByteArraySearch('stco', this.rawdata, 0); 
		this.rawdata.position = stco+8;
		stco_numchunks = this.rawdata.readInt(); // numchuncks lol!

		for(x = 0; x < stco_numchunks; x++)
		{
				taddr = this.rawdata.readUnsignedInt();
				
				temp_array = new Array(2);
				temp_array[0] = taddr; // address
				temp_array[1] = new Array(); // sample size array (populated later)
				
				this.rawaudio_ptrs[x] = temp_array; // address

		}
		
			
		//CHUNK GROUP/SET TABLE
		air.trace("MP4: Chunk group");
		// there will probably always be 2 chunk sets for most cases for the YT videos. the last one will likely be the odd ball-- less samples per chunk than the first since its at the end. it prolly wont line up perfectly
		stsc = ByteArraySearch('stsc', this.rawdata, 0); 
		this.rawdata.position = stsc+8;
		stsc_chunkcount = this.rawdata.readInt(); // how many chunk groups we are processing
		var stsc_chunkarray = new Array();
		
		for(x = 0; x < stsc_chunkcount; x++) // run through chunk table and extract values
		{

			temp_array = new Array(3);
			temp_array[0] = this.rawdata.readInt();	// chunk id
			temp_array[1] = this.rawdata.readInt();	// samples per chunk
			temp_array[2] = null;	// reserved for total # of samples associated with this chunk config
			this.rawdata.readInt(); // move up 4 more please and thanks
			stsc_chunkarray[x]=temp_array;
		}
		
		//reconstruct chunk and sample table to get chunk size for each large chunk designation
		for(x = 0; x < stsc_chunkcount; x++) // getting total samples per chunk config. i know you like my steez
			if(stsc_chunkarray[x+1])
				stsc_chunkarray[x][2] = (stsc_chunkarray[x+1][0] - stsc_chunkarray[x][0])*stsc_chunkarray[x][1];
			else 
				stsc_chunkarray[x][2] = stsc_chunkarray[x][1];
			// ********** ^this is tricky. IF they change the way they encode, it could break this, so be careful. last chunk group gets a total sample size equal to its samples per chunk.
			//********** ^this assumes that the last chunk group describes ONE chunk, containing the remaining samples that couldnt fit in the first chunk group
				
		// SAMPLE SIZE TABLE
		air.trace("MP4: Sample size table");
		stsz = ByteArraySearch('stsz', this.rawdata, 0); 
		this.rawdata.position = stsz+12;
		stsz_numentries = this.rawdata.readInt();
		var stsz_samplearray = new Array();
		for(x = 0; x < stsz_numentries; x++) // run through data and grab the size of each sequential sample
			stsz_samplearray[x] = this.rawdata.readInt();

		// CHUNK SIZE ROUTINE	
		air.trace("MP4: Chunk size routine");
		count = 0;
		lastgroup = 0;
		chunkmarker = 0;
		
		//ERROR WAS HERE- chunkgroup was set to null, which casued errors in the conditional statement . FIXED... mostly...lol 
		for(x = 0; x < stsz_numentries; x++) //populate chunk sizes. x goes to total samples
		{
			temp_total = 0;
			stsc_chunkgroup = null; // temp chunkgroup. used to help in setting chunk sizes
			ex = 0;
			for(y = 0; y < stsc_chunkcount; y++) //figure out which chunk group this chunk belongs to
			{
				if(stsc_chunkarray[y-1])
					temp_total += stsc_chunkarray[y-1][2];
		
				ex = x - temp_total; // ex is equivalent size
				
				// as long as x is within the bounds of this chunk group "total samples", it belongs to this chunk
				if(ex < stsc_chunkarray[y][2] && stsc_chunkgroup == null) 
					stsc_chunkgroup = stsc_chunkarray[y];
			}
			if(stsc_chunkgroup == null)
				stsc_chunkgroup = stsc_chunkarray[stsc_chunkarray.length-1]; // i guess.  i dunno, actually
			//each chunk needs to have an array of audio sample sizes. this array is limited by the chunkgroup "sample per chunk" attribute. after reaching the limit, the next chunk is used
			
			if(this.rawaudio_ptrs[chunkmarker][1].length == stsc_chunkgroup[1] || ((lastgroup != stsc_chunkgroup[1]) && (lastgroup != 0)))
			{
				chunkmarker++;
			}
			
			this.rawaudio_ptrs[chunkmarker][1].push(stsz_samplearray[x]); // put the sample size in the field
			
			//air.trace("SSA: "+this.rawaudio_ptrs[chunkmarker][1][0]);
			lastgroup = stsc_chunkgroup[1];
			count++;
		}

		//2- reconstruct audio stream by putting them back together, FIFO
		air.trace("MP4: Build rawaudio_data");
		for(x=0; x < this.rawaudio_ptrs.length; x++) // step through chunks populating the audiodata
		{
			temp_chunksize = 0;
			for(y=0; y < this.rawaudio_ptrs[x][1].length; y++)
				temp_chunksize = temp_chunksize + this.rawaudio_ptrs[x][1][y];
			
	//air.trace("RAPXS: "+this.rawaudio_ptrs[x][1].length+" OP: "+this.rawaudio_ptrs[x][0]+" NP: "+this.rawaudio_data.length+" C: "+temp_chunksize);
					
			this.rawdata.position = this.rawaudio_ptrs[x][0];
			this.rawdata.readBytes(this.rawaudio_data, this.rawaudio_data.length, temp_chunksize);

		}
		
		//3- remove 2nd trak section (this is for video for youtube)
		air.trace("MP4: Truncate rawdata");
		// truncate rawdata
		// ^plus one so that it gets to the 2nd trak
		// *** this is also  a part to be careful with. we are assuming: 2 traks, 1st is audio, 
		// 2nd is video. this SHOULD be the case all the time, but no guarantee
		
		trak2 = ByteArraySearch("trak", this.rawdata, ByteArraySearch("trak", this.rawdata, 0)+1);  // yea u like my steez
		this.rawdata.length = trak2-4;  // its minus 4 because the trak box begins 4 bytes before the string "trak"
		
		//4- replace existing mdat with reconstructed audio stream
		
		air.trace("MP4: Inject raw_audiodata into rawdata");
		
		//mdat_length = this.rawdata.length + 8; // plus 8 because the mdat length includes the size and string "mdat"
		//mdat_header = 
		
		air.trace("MP4 RADL: "+ this.rawaudio_data.length);
				
		this.rawdata.position = this.rawdata.length; // position it at the endd
		mdatLoc = this.rawdata.position;
		this.rawdata.writeUnsignedInt(this.rawaudio_data.length + 8); // write the size of the mdata
		// ^ plus 8 because of mdat(4) and size(4). 
		this.rawdata.writeUTFBytes("mdat"); // write the mdat string
		mdat_start = this.rawdata.position; // we use this shortly. its the location where the mdat data will start.
		// write the rest of the data (use a loop so we dont nuke the memory plz and thnx)
		this.rawaudio_data.position = 0; // reset the position of rawaudio so we can grab chunks from it easily
		write_size = 256; // write data in 256 byte chunks

		this.rawdata.writeBytes(this.rawaudio_data, 0, this.rawaudio_data.length); // original 
		
		//mdat size is done such that converting it directly to a memory offset is TWO more than the filesize. gives an EOF in hex editor
		
		//5- update offsets in stco 
		air.trace("MP4: Update rawdata chunk offsets");
		this.rawdata.position = stco+12;

		last_chunksize = 0;
		for(x = 0; x < stco_numchunks; x++)
		{
			this.rawdata.writeUnsignedInt(mdat_start + last_chunksize);
			for(y=0; y < this.rawaudio_ptrs[x][1].length; y++)
				last_chunksize += this.rawaudio_ptrs[x][1][y];			
		}
		
		rawString = this.rawdata.toString();

		this.rawdata.position = rawString.indexOf("moov") - 4;
		this.rawdata.writeInt(mdatLoc - this.rawdata.position);
			
		air.trace("processMP4(fmt18): end"); 
		//end of the PROCESSMP4 function 	
	}


	me.load(); // DO IT LIVE
	// me.load2(); // NOT LIVE
}

/**************************************************************************UNUSED
########     ###            ##     ##    ###    ##    ## 
##     ##   ## ##           ###   ###   ## ##   ###   ## 
##     ##  ##   ##          #### ####  ##   ##  ####  ## 
##     ## ##     ## ####### ## ### ## ##     ## ## ## ## 
##     ## #########         ##     ## ######### ##  #### 
##     ## ##     ##         ##     ## ##     ## ##   ### 
########  ##     ##         ##     ## ##     ## ##    ## 
*/
function xdownloadMan(dmCallback) // // download manager. he should keep his array nice and tidy.
{
	
	var me = this;
	
	this.cb = dmCallback;
	this.downloadQueue = new Array();
	
	this.addMan = function(downloadObj) //yeaah yeeeaaa
	{
		downloadQueue.push(downloadObj); // stickem in there
	}
	
	this.getMan = function(downloadObj) //yeaah yeeeaaa. for cancells and when its done
	{
		return downloadQueue.shift();
	}
	
	this.cancelMan = function(downloadObj) //yeaah yeeeaaa. for cancells and when its done
	{
		downloadQueue.shift(); // stickem in there
	}
	
	
}


/**************************************************************************
######## ##     ## ######## ########     ###     ######   #######  ##    ## 
##        ##   ##     ##    ##     ##   ## ##   ##    ## ##     ## ###   ## 
##         ## ##      ##    ##     ##  ##   ##  ##       ##     ## ####  ## 
######      ###       ##    ########  ##     ## ##       ##     ## ## ## ## 
##         ## ##      ##    ##   ##   ######### ##       ##     ## ##  #### 
##        ##   ##     ##    ##    ##  ##     ## ##    ## ##     ## ##   ### 
######## ##     ##    ##    ##     ## ##     ##  ######   #######  ##    ## 
 
*/

function extraCon(exCallback) // turns out this guy's pretty important
{
	

	
	this.cb = exCallback;
	
	var me = this;
	this.title = "";
	//this.isNewArtist = true;
	this.contributorName = "";
	this.mixList = new Array();
	this.artistList = new Array();
	this.allList = new Array();
	this.gUrl = "http://google.com/search?hl=en&q="; // google
	this.bUrl = "http://bing.com/search?format=rss&q="; // bing
	this.wUrl = "http://wikipedia.org/wiki/"; // wikipedia
	this.aUrl = "http://www.youtube.com/get_video_info?el=&video_id="; // amazon
	this.yUrl = "http://www.youtube.com/disco?action_search=1&query=";
	//this.yUrl = "http://www.youtube.com/disco?search_type=disco&rental=0&ajax=1&search_query="; // youtube disco

	//air.trace("T:"+title);
	this.getArtist = function() // title parse, bing search
	{

		titlesource = me.title;
		//air.trace("UGLYMAN:"+titlesource);
		air.trace("getArtist: start: " + titlesource);
		splitarray = 
		[
		'~', '- ','vs.','VS.','Vs.',' -',' \'','\' ',"feat.", "feat ", " feat", "ft.", 
		"Ft.", "Feat", "Feat.", ':', '"', " by "
		];
		
		splitarrayWiki = 
		[
			'music','actor','poet', 'public domain', 'artist', 'record', 'genre', 'royalty free', 'label', 'famous', 'vintage' 
		];
		
		buffer = "";
		ignore = 0;
		var searchterms = new Array();
		for(x in titlesource)
		{
			buffer += titlesource[x];
			for(y in splitarray)
				if((buffer.lastIndexOf(splitarray[y]) >= 0))
				{
						searchterms.push(trim(buffer.replace(splitarray[y],'')));
						buffer = "";
				}
		}
		searchterms.push(buffer);
		searchstring = "";
		
		
		for(q in searchterms)
		{
			// replacing spaces with commas within each individual seach "group" seems to help improve search results for all engines
			if((searchterms[q]) && (searchterms[q] != ''))	 // this still isnt perfect... 
			{
				// we were having issues with the search engines not liking the extra characters, so we clean it up the query a bit
				if(q == 0) 
					searchstring = '"'+trim(searchterms[q]).replace(/ /g,',')+'"';
				else
					searchstring += " or " + '"'+trim(searchterms[q]).replace(/ /g,',')+'"'; 
			}

		}

		searchstring += " music site:wikipedia.org";
		//air.trace(searchstring);
		air.trace("getArtist: Polling Bing: "+ me.bUrl+searchstring);
		var request = new air.URLRequest(me.bUrl+searchstring);
		request.useCache = true;
		request.cacheResponse = true;
		var loader = new air.URLLoader();
	
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		
		loader.addEventListener(air.Event.COMPLETE, me.getArtist2);
		loader.load(request); 
	};
	
	this.getArtist2 = function(event) // bing parse, wiki search
	{
		air.trace("getArtist: Polling Bing: Done--");
		sourcecode = event.target.data;
		sStart = sourcecode.indexOf("wikipedia.org/wiki/"); 
		sEnd = sourcecode.indexOf('</link>', sStart+1);
		turl = "http://"+sourcecode.substring(sStart, sEnd);	
		if(sStart >= 0)
		{	
			air.trace("getArtist: Polling Wiki:"+turl);

			
			var request = new air.URLRequest(turl);
			request.useCache = true;
			request.cacheResponse = true;
			var loader = new air.URLLoader();
		
			loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
			
			loader.addEventListener(air.Event.COMPLETE, me.getArtist3);
			loader.addEventListener(air.IOErrorEvent.IO_ERROR, me.getArtist3);
				

			loader.load(request); 
		}
		else
			me.getArtist3(event);
	};
	
	this.getArtist3 = function(event) // wiki parse: this shit is BUGGY. apparently there's no markup for music entries on wiki
	{
	//air.trace("ASDSDASDDASD:"+event);
		
		sourcecode = event.target.data;
		artist = "";
		
		sStart = sourcecode.indexOf("infobox");
		sEnd = sourcecode.indexOf('</table>', sStart+1)
		sourcecode = sourcecode.substring(sStart, sEnd);
		
		if(sourcecode.indexOf("by <span") >= 0) // if this is positive, it is probably an album
		{
			sStart = sourcecode.indexOf("by <span"); 
			sEnd = sourcecode.indexOf('</a>', sStart+1);
			artist = sourcecode.substring(sStart, sEnd);
			artist = artist.substring(artist.lastIndexOf('>')+1, artist.length);
		}
		else if(sourcecode.indexOf("by <a") >= 0) // if this is positive, it is probably a song
		{
			sStart = sourcecode.indexOf("by <a"); 
			sEnd = sourcecode.indexOf('</a>', sStart+1);
			artist = sourcecode.substring(sStart, sEnd);
			artist = artist.substring(artist.lastIndexOf('>')+1, artist.length);
		}
		else // otherwise, it is probably not a song and we need to figure out if its an artist or not
		{
			sourcecode = event.target.data;
			vStart = sourcecode.indexOf("catlinks"); 
			//vStart = sourcecode.lastIndexOf("catlinks"); 
			
			buffer = true; // reduce, reuse, recycle
			for(y in splitarrayWiki)
				if(sourcecode.indexOf(splitarrayWiki[y], vStart) >= 0)
				{
					//vStart = sourcecode.indexOf("<title>");
					//vEnd = sourcecode.indexOf(' - Wikipedia', vStart+1)
					//artist = sourcecode.substring(vStart+7, vEnd);
					artist = squeeze(sourcecode, "<title>", ' - Wikipedia');
					break;
				}	
		}
		if(artist.length > 0 && artist.length < 100) // some sanity. in case we fail at this, the artist name will either be empty or really long
			me.contributorName = artist;
			
		air.trace("getArtist: Done");
		air.trace("getArtist3:"+artist);
		me.cb();
		//air.trace("getArtist3:"+me.cb);
	};
	
	this.getPlaylist = function(callBack) // ask disco for a play list
	{
		air.trace("getPlaylist: start (Part 1/4)"); 
		
		me.cb = callBack;
		air.trace("getPlaylist: Polling Disco: "+ me.yUrl+me.contributorName);
		var request = new air.URLRequest(me.yUrl+me.contributorName);
		request.useCache = true;
		request.cacheResponse = true;
		var loader = new air.URLLoader();
	
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		loader.addEventListener(air.Event.COMPLETE, me.getPlaylist2);
		//air.trace("getPlaylist: grabbing list from Disco (Part 1)"); 
		loader.load(request);	
	};
	
	this.getPlaylist2 = function(event) // parse the disco lists
	{
		air.trace("getPlaylist2: grabbing list from Disco (Part 2/4)"); 
		
		
		sourcecode = event.target.data;
		discoURL = "http://youtube.com/" + squeeze(sourcecode, "\\/", "\"}");
		air.trace("getPlaylist2: got URL: " + discoURL); 
		
		
		var request = new air.URLRequest(discoURL);
		request.useCache = true;
		request.cacheResponse = true;
		var loader = new air.URLLoader();
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		loader.addEventListener(air.Event.COMPLETE, me.getPlaylist3);
		loader.load(request);	
		
		
	}
	
	
	this.getPlaylist3 = function(event) // parse the disco lists out of the webpage, then ask for info
	{
		air.trace("getPlaylist3: Grabbing the id's in the lists (Part 3/4)"); 
		sourcecode = event.target.data;
		//me.artistList.length = 0;
		me.mixList.length = 0;
		me.allList.length = 0;

		me.mixList = squeeze(sourcecode, "data-list-type=\"ML\" data-video-ids=\"", "\" ");
		me.mixList = me.mixList.split(",");
		
		//me.mixList = squeeze(sourcecode, "'RELATED_VIDEOS_SHOWN': '", "',");
		//me.mixList = me.mixList.split("|");
		
		
		listinfoURL = "http://youtube.com/video_info_ajax?action_get_videos_data=1&video_ids=";
		listinfoURL += me.mixList.toString();
		
		var request = new air.URLRequest(listinfoURL);
		request.useCache = true;
		request.cacheResponse = true;
		var loader = new air.URLLoader();
		loader.dataFormat  = air.URLLoaderDataFormat.TEXT;
		loader.addEventListener(air.Event.COMPLETE, me.getPlaylist4);
		//air.trace("XXXXXXXXXXXXXXXX: " + listinfoURL);
		loader.load(request);
		
	}
	
	
	this.getPlaylist4 = function(event) // put the arrays together all nice
	{
	
		// make sure the artist name is included in namemix ***KUSH
		air.trace("getPlaylist4: Parsing JSON and Cleaning up (Part 4/4)"); 

		var jData = eval('(' + event.target.data + ')'); // *close enough pose again*
		//air.trace("WWW: " + event.target.data); 
		
		if(!jData.data)
		{
			air.trace("getPlaylist4: WOMP-- NO JSON DATA");
			me.cb(me.allList);
		}
	
		for(x = 0; x < me.mixList.length; x++)
		{		
			try
			{
				//air.trace("WWW: " +jData.data[me.mixList[x]].title); 
				if(jData.data && jData.data[me.mixList[x]])
					me.allList.push(new Array("", jData.data[me.mixList[x]].title, jData.data[me.mixList[x]].encrypted_id));
				
			}
			catch (e)
			{
				air.trace("PLAYLIST JSON ERROR: " +e.toString());
			}
		}
		
		for(x = 0; x < me.artistList.length; x++)
		{		
			try
			{
				if(jData.data && jData.data[me.artistList[x]])
					me.allList.push(new Array("", jData.data[me.artistList[x]].title, jData.data[me.artistList[x]].encrypted_id));
				//air.trace("PPP: " + me.allList[x][1] + me.allList[x][2]);
			}
			catch (e)
			{
				air.trace("PLAYLIST JSON ERROR: " +e.toString());
			}
		}
		
		air.trace("getPlaylist4: DONE");
		me.cb(me.allList);
		
	}
	/****************************************
		me.getArtist()for wandering search
		or simply dont call it to not search 
		in that case, we'd need to detect if its a playlist entry or not
		here i think we can disable wandering playlist. this could be an "option"
		in fact, we can control the degree of wandering by tweaking the freq. hmmm...
		
		we can also offer them the hyper-restrictive playlist if we parse the other list
		
		also, if the playlist is small, we can compare the new one with the old one
		favoring larger playlists if they want (less specialized music). another "option"
		
		also, when we do mouse gestures for controlling the volume, if they want to turn it up higher than 
		the max volume, the mouse gesture will automatically start increasing their underlying cpu volume 
		
		because sometimes you want it louder but you dont want to have to go adjust the volume manually.
		"this one goes up to 11"
		
		also make a marker in the playlist search results that indicates if the song has 
		ever been played, and an indicator of if its been played recently
		
		community product targeting / marketing vs. traditional advertising methods.
		by creating a uniqe product specifically for an entire set of people, they will be
		more likely to try it out. and, if they like it, recommend it to friends.
		
		so you're basically letting people tweet music at each other and it showing up in their queue instantly
		
		for lyrics search, google: "it's impossible to stay" lyrics
		grab title of search results. when they click on it, auto search in app for that song
		
		MAKE THIS SHIT IPV6 ONLY
		http://[2001:db8:ccc3:ffff:0:444d:555e:666f]:1935/test
		
		name of program = "AAIR(pronounced-YAARRRR)" (might be too hot tho...)
	****************************************/
	this.go = function(sme_title, exCallback) // parse the disco lists
	{
		me.title = sme_title;
		me.cb = exCallback;
		me.getArtist();
	}
	/*
	var newArtist = false;
	if($_CONFIG_PLAYLISTMODE < 2 && newArtist = false) // 0 = artist playlist (little roam, no search), 1 = related playlist (some roam, no search), 2 = roaming playlist (high roam, saerch), 3 = discovery mode (all roam. random,)
	{
		air.trace("OOOAAHHH");
		newArtist = false;
	}
	else 
	{
		air.trace("3333333333333");
		me.getArtist();
		newArtist = true;
	}
	*/
	
}


/**************************************************************************
##     ## ########  ##          ###    ##    ## 
###   ### ##     ## ##         ## ##    ##  ##  
#### #### ##     ## ##        ##   ##    ####   
## ### ## ########  ##       ##     ##    ##    
##     ## ##        ##       #########    ##    
##     ## ##        ##       ##     ##    ##    
##     ## ##        ######## ##     ##    ##  
   
*/



function mediaPlayer(mpCallback) // despite the name, this is more of like a playlist manager
{

	var me = this;
	//this.newPlaylist = new Array(); // [artist, song, id]
	//this.lastPlaylist = new Array(); // [artist, song, id] archive of last playlist before a setPlaylist
	this.historicalPlaylist = new Array();
	
	this.aPlaylist = new Array(); // [artist, song, id]
	this.rPlaylist = new Array(); // [artist, song, id]
	
	this.haPlaylist = new Array(); // [artist, song, id]
	this.hrPlaylist = new Array(); // [artist, song, id]
	
	this.mode = 1; // 0 = normal, 1 = random
	this.done = false;
	this.pos = 0; // position of newPL
	this.posH = 0; // position of histPL
	this.ready = false;
	this.cb = mpCallback;
	this.source = 0;

	this.whichPlaylist = function()
	{

		//if($_CONFIG_PLAYLISTMODE == 0) 
			return me.rPlaylist;
		//else if($_CONFIG_PLAYLISTMODE == 1) 
		//	return me.aPlaylist;
		//else if($_CONFIG_PLAYLISTMODE == 2) 
		//	return me.haPlaylist;
		//else
		//	return me.hrPlaylist;
	}
	
	this.setPlaylist = function(tarray, type) 
	{
		if(type == "a")
		{
			me.haPlaylist = me.aPlaylist;
			me.aPlaylist = tarray;
			//air.trace("XXXXXXXXXXXXXXXXXXXXXXX" +me.aPlaylist.length );
			
		}
		else
		{
			me.hrPlaylist = me.rPlaylist;
			me.rPlaylist = tarray;
		}
		
		me.ready = true;
	}
	
	this.appendPlaylist = function(tarray, type) 
	{
		if(type == "a")
			me.aPlaylist.push(tarray);
		else
			me.rPlaylist.push(tarray);
			
		me.ready = true;
	}
	
	
	this.playerDone = function(msg) 
	{ 
		// dang yo i'm kind of a beast. set the callback for status, which is called on send(). 
		// then i call send() to trigger the callback function. this way i can escape the crappy object comm model
		air.trace("mediaPlayer -> playerDone: " + msg );
		//me.done = true;
		this.send("_friaa", "theFunction","ACK"); // this is for the LC caller object
	} 

	this.next = function()  // make it random for now i guess. this returns the ID of an element in the playlist
	{ 
		if(!me.ready)
			return false;
		

		if ($_CONFIG_PLAYLISTMODE == 1)
		{
			//air.trace("HERE");
			air.trace("mediaPlayer: Changing Songs (Fav.)");
			tpos = Math.floor(Math.random()*favorites.favPlaylist.length);
			me.play(new Array(favorites.favPlaylist[tpos][2], "", favorites.favPlaylist[tpos][1]), true);
			return false;
		}
		
		air.trace("mediaPlayer: Changing Songs (Mix)");
		tPlaylist = me.whichPlaylist();
		
		//if((me.done == true) && (me.pos < me.newPlaylist.length))
		{	
			me.pos = Math.floor(Math.random()*tPlaylist.length);
		//	air.trace("PPPPPPPPPPPPPPPPPPPPPPPPPPP: " + tPlaylist.length);
			if(tPlaylist[me.pos] != null) // sanity check
			{
				air.trace("Adding to HPL: " +tPlaylist[me.pos] );
				me.historicalPlaylist.push(tPlaylist[me.pos]); // save it for later ;)
				me.posH = me.historicalPlaylist.length-1;
				air.trace("mediaPlayer: Next up:= "+tPlaylist[me.pos][0] + ' - ' + 
					tPlaylist[me.pos][1]);
						me.cb(me); // cb is usually playClip()
			}
		}
		
		return false;
	} 
	
	this.play = function(tarray, hard)  
	{ 
		// add it to the playlist, then call the callback
		if(hard == true) // plays without scraping the playlist
			me.aPlaylist.length = 0;
			
		me.appendPlaylist(tarray, "a");
		me.ready = true;
		me.pos = me.aPlaylist.length-1;

		me.historicalPlaylist.push(me.aPlaylist[me.pos]); // save it for later ;)
		me.posH = me.historicalPlaylist.length-1;
		me.cb(me);
	}
	
	
	this.prev = function()  // here, we grab the ID from the historical playlist going backwards
	{ 
		if(me.historicalPlaylist && (me.historicalPlaylist.length > 0))
		{

			if((me.posH - 1) >= 0)
			{
				me.posH = me.posH - 1;
				//me.newPlaylist.push(me.historicalPlaylist[me.posH]);
				//me.pos = me.newPlaylist.length-1;
				//me.cb(me); // cb is usually playClip(). but it doesnt have to be
			}

		}
	}
	
	this.fwd = function()  // here, we grab the ID from the historical playlist going forward
	{ 
		if(me.historicalPlaylist && (me.historicalPlaylist.length > 0))
		{
			if((me.posH + 1) <= (me.historicalPlaylist.length-1))
			{
				me.posH = me.posH + 1;
				//me.newPlaylist.push(me.historicalPlaylist[me.posH]);
				//me.pos = me.newPlaylist.length-1;
				//me.cb(me); // cb is usually playClip(). but it doesnt have to be
			}
		}
	}
	
	
	this.getId = function(history) // get ID of currently positioned song
	{	
		
		tPlaylist = me.whichPlaylist();
			
		if(history)	
		{
			if(me.historicalPlaylist[me.posH][2])
				return me.historicalPlaylist[me.posH][2];
			else
				return ' ';
		}
		else
		{
			if(tPlaylist[me.pos] && tPlaylist[me.pos][2])
				return tPlaylist[me.pos][2];
			else
				return ' ';
		}
	}
	
	this.setMode = function(tmode) // get ID of currently positioned song
	{		
		if(tmode >= 0)
			me.mode = tmode;
	}
	
	this.getTitle = function(history) // get Title (Artist + Name) of currently positioned song
	{	
	
		
		if(history)	
		{
			//air.trace("YEEEEEEEEEEEEEEEEE: " + history);
			if(me.historicalPlaylist[me.posH][0])
				return me.historicalPlaylist[me.posH][0];
			if(me.historicalPlaylist[me.posH][1])	
				return me.historicalPlaylist[me.posH][1];
				//return me.historicalPlaylist[me.posH][0] + ' - ' + me.historicalPlaylist[me.posH][1];
			else 
				return false;
		}
		else
		{
			tPlaylist = me.whichPlaylist();
			
			if(tPlaylist[me.pos][0])
				return tPlaylist[me.pos][0];
			if(tPlaylist[me.pos][1])
				return tPlaylist[me.pos][1];
				//return me.newPlaylist[me.pos][1];
				//return me.newPlaylist[me.pos][0] + ' - ' + me.newPlaylist[me.pos][1];
			else 
				return false;
		}
	}
	
	this.getArtist = function(history) // get Artist of currently playing song
	{
	
		tPlaylist = me.whichPlaylist();
	
		if(history)	
		{
			if(me.historicalPlaylist[me.posH][0])
				return me.historicalPlaylist[me.posH][0];
			else
				return ' ';
		}
		else
		{
			if(tPlaylist[me.pos][0])
				return tPlaylist[me.pos][0];
			else
				return ' ';
		}
	}
	
	this.getName = function(history) // get Name of currently playing song
	{
	
		tPlaylist = me.whichPlaylist();
		
		if(history)	
		{
			if(me.historicalPlaylist[me.posH][1])
				return me.historicalPlaylist[me.posH][1];
			else
				return ' ';
		}
		else
		{
			if(tPlaylist[me.pos][1])
				return tPlaylist[me.pos][1];
			else
				return ' ';
		}
	}
	
	this.dump = function(playlist)
	{
	

		switch(playlist)
		{
			case "a":
				playlist = me.aPlaylist;
				air.trace("========================Artist========================");
				break;
			
			case "ha":
				playlist = me.haPlaylist;
				air.trace("========================Historical Artist========================");
				break;
			
			case "r":
				playlist = me.rPlaylist;
				air.trace("========================Related========================");
				break;
			
			case "hr":
				playlist = me.hrPlaylist;
				air.trace("========================Historical Related========================");
				break;
			
			default:
				playlist = me.aPlaylist;
				air.trace("========================Hsitorical Related========================");
				break;
		}
		
		x = 0;
		while(playlist[x])
		{
			air.trace(playlist[x][0] + " - " + playlist[x][1]);
			x++;
		}
	
	}

	var dlc = new air.LocalConnection(); 
	dlc.allowDomain('*');
	dlc.connect("_friaa");
	dlc.addEventListener(air.StatusEvent.STATUS, this.next);
	dlc.client = this;
}

/**************************************************************************

########    ###    ##     ##  
##         ## ##   ##     ## 
##        ##   ##  ##     ## 
######   ##     ## ##     ##   
##       #########  ##   ##  
##       ##     ##   ## ##   
##       ##     ##    ###      
   
*/


function fav(favCallback) // favorites playlist
{

	var me = this;
	this.cb = favCallback;
	this.favPlaylist = new Array(); // [blank, id, title] 

	this.contains = function(id)
	{
		
		for(fx = 0; fx < me.favPlaylist.length; fx++)
				if(id == me.favPlaylist[fx][1])
					return true;
		return false;
	}
	
	
	this.add = function(item)
	{
		//air.trace("Adding to Fav:" + item[0]);
		me.favPlaylist.push(item);
		//me.save();
	}
	
	this.remove = function(id)
	{
		//air.trace("Adding to Fav:" + item[0]);
		//me.favPlaylist.push(item);
		
		x = 0;
		while(me.favPlaylist[x])
		{
			if(me.favPlaylist[x][1] == id)
				me.favPlaylist.splice(x,1);
			x++;
		}
		
		
		//me.favPlaylist.splice(index,1);
		//me.save();
	}
	
	this.up = function(tindex)
	{
		tindex = parseInt(tindex);
		if(tindex > 0)
		{
			telem = me.favPlaylist[tindex];
			me.favPlaylist[tindex] = me.favPlaylist[tindex-1];
			me.favPlaylist[tindex-1] = telem;
		}
	}
	
	
	this.down = function(tindex)
	{
		tindex = parseInt(tindex);
		if(tindex < me.favPlaylist.length-1)
		{
			telem = me.favPlaylist[tindex];
			me.favPlaylist[tindex] = me.favPlaylist[tindex+1];
			me.favPlaylist[tindex+1] = telem;
		}
	}
	
	this.dump = function()
	{
		air.trace("Starting Fav. Dump:\n");
		x = 0;
		while(me.favPlaylist[x])
		{
			air.trace(me.favPlaylist[x][1] + " - " + me.favPlaylist[x][2]);
			x++;
		}
	}
	
	this.save = function()
	{
		air.trace(".."); 
		var file = air.File.applicationStorageDirectory.resolvePath("aair-playlist.xml");
		var stream = new air.FileStream();
		var x = 0;
		var str;
		
		try
		{
		
			str = "<?xml version='1.0' encoding='UTF-8'?>" + air.File.lineEnding +
			"<application>" + air.File.lineEnding;
			
			x = 0;
			while(me.favPlaylist[x])
			{
				str += "<item>" + air.File.lineEnding + 
				"<id>" + me.favPlaylist[x][1] + "</id>" + air.File.lineEnding +
				"<title>" + quoteXml(me.favPlaylist[x][2]) + "</title>" + air.File.lineEnding + 
				"</item>" + air.File.lineEnding;
				
				x++;
			}
			
			str += "</application>";
			
			
			
			//here, we format the playlist array into xml
			
			//outputString = outputString.replace(/\n/g, File.lineEnding)
			
			//var serializer = new XMLSerializer();
			//str2 = serializer.serializeToString(str);

			
			
			stream.open( file, air.FileMode.WRITE );
			
			stream.writeUTFBytes(str);
			stream.close();
			//air.trace("Saving Fav: DONE: "); 
		}
		catch (e)
		{
			air.trace("ERROR: fav cant save playlist: " + e); 
		}
		
	}
	
	this.load = function()
	{
		air.trace(".");
		var file = air.File.applicationStorageDirectory.resolvePath("aair-playlist.xml");
		var prefsXML;
		var domParser = new DOMParser();
		try
		{
				var str;
				var stream = new air.FileStream();			
				stream.open( file, air.FileMode.READ );			
				str = stream.readUTFBytes(stream.bytesAvailable);
				stream.close();
				me.favPlaylist.length=0;
				
				prefsXML = domParser.parseFromString(str, "text/xml");
			
				XML_items = prefsXML.getElementsByTagName("item");
				XML_ids = prefsXML.getElementsByTagName("id");
				XML_titles = prefsXML.getElementsByTagName("title");
				
				for(x = 0; x < XML_items.length; x++)
				{
					if(XML_ids[x].firstChild && XML_titles[x].firstChild)
					{
						me.add(new Array("", XML_ids[x].firstChild.nodeValue, unquoteXml(XML_titles[x].firstChild.nodeValue)));
					}
					//air.trace("YAY: " + XML_ids[x].firstChild.nodeValue + ' ' + XML_titles[x].firstChild.nodeValue);
				}

				//air.trace("YAY:" + prefsXML.getElementsByTagName("item").length); 
				
		}
		catch (e)
		{
			air.trace("ERROR: fav Missing or Corrupt playlist: " + e ); 
		}
		
	}
	

}