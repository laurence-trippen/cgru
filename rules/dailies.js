d_moviemaker = '/cgru/utilities/moviemaker';
d_makemovie = d_moviemaker+'/makemovie.py';
d_guiparams = ['input','output','artist','activity','version','filename'];

d_expguiparams = [];
d_expguiparams.push({"name":'quality',"label":'Compression rate, 1 is the best quality'});
d_expguiparams.push({"name":'resolution'});

function d_Make( i_path, i_outfolder)
{
	c_Log('Make Dailies: '+i_path);

	var params = {};

	params.version = i_path.split('/');
	params.version = params.version[params.version.length-1];
	var match = params.version.match(/v\d{2,}.*/gi);
	if( match )
		params.version = match[match.length-1];

	var readir = n_WalkDir([i_path], 0)[0];
	if( readir && readir.files && readir.files.length )
	for( var f = 0; f < readir.files.length; f++ )
	{
		var file = readir.files[f];
		var match = file.match(/\d{1,}\./g);
		if( match )
		{
			match = match[match.length-1];
			var pos = file.lastIndexOf( match);
			var pattern = file.substr( 0, pos);
			for( var d = 0; d < match.length-1; d++ ) pattern += '#';
			pattern += file.substr( pos-1 + match.length);
			i_path += '/' + pattern;
			break;
		}
//window.console.log( match);
	}

	params.input = i_path;
	params.output = i_outfolder;

	params.artist = c_GetUserTitle();
	params.activity = RULES.dailies.activity;

	var dateObj = new Date();
	date = ''+dateObj.getFullYear();
	date = date.substr(2);
	date += (dateObj.getMonth()+1) < 10 ? '0'+(dateObj.getMonth()+1) : dateObj.getMonth()+1;
	date +=  dateObj.getDate()     < 10 ? '0'+ dateObj.getDate()     : dateObj.getDate();

	var naming = RULES.dailies.naming;
	var filename = RULES.dailies.naming;
	filename = filename.replace('(p)', ASSETS.project.name);
	filename = filename.replace('(P)', ASSETS.project.name.toUpperCase());
	filename = filename.replace('(s)', ASSETS.shot.name);
	filename = filename.replace('(S)', ASSETS.shot.name.toUpperCase());
	filename = filename.replace('(v)', params.version);
	filename = filename.replace('(V)', params.version.toUpperCase());
	filename = filename.replace('(d)', date);
	filename = filename.replace('(D)', date.toUpperCase());
	filename = filename.replace('(a)', params.activity);
	filename = filename.replace('(A)', params.activity.toUpperCase());
	filename = filename.replace('(c)', RULES.company);
	filename = filename.replace('(C)', RULES.company.toUpperCase());
	filename = filename.replace('(u)', params.artist);
	filename = filename.replace('(U)', params.artist.toUpperCase());
	params.filename = filename;

	var wnd = new cgru_Window('dailes','Make Dailies');
	wnd.elContent.classList.add('dailies');

	wnd.m_elements = {};
	for( var p = 0; p < d_guiparams.length; p++)
	{
		var elDiv = document.createElement('div');
		wnd.elContent.appendChild( elDiv);

		var elLabel = document.createElement('div');
		elDiv.appendChild( elLabel);
		elLabel.classList.add('label');
		elLabel.textContent = d_guiparams[p]+':';
		elLabel.style.textTransform = 'capitalize';

		var elParam = document.createElement('div');
		elDiv.appendChild( elParam);
		elParam.classList.add('param');
		elParam.textContent = params[d_guiparams[p]];
		elParam.contentEditable = 'true';

		wnd.m_elements[d_guiparams[p]] = elParam;
	}

	var elBtns = document.createElement('div');
	wnd.elContent.appendChild( elBtns);

	var elAfDiv = document.createElement('div');
	elBtns.appendChild( elAfDiv);
	elAfDiv.classList.add('label');
	elAfDiv.innerHTML = '<a href="http://'+cgru_Config.af_servername+':'+cgru_Config.af_serverport+'" target="_blank">AFANASY</a>';

	var elSend = document.createElement('div');
	elBtns.appendChild( elSend);
	elSend.textContent = 'Send Job';
	elSend.classList.add('button');
	elSend.onclick = function(e){ d_ProcessGUI( e.currentTarget.m_wnd);}
	elSend.m_wnd = wnd;

	var elRules = document.createElement('div');
	wnd.elContent.appendChild( elRules);
	elRules.classList.add('rules');
	elRules.textContent = 'RULES.dailies='+JSON.stringify(RULES.dailies).replace(/,/g,', ');
}

function d_ProcessGUI( i_wnd)
{
	var params = {};
	for( var p = 0; p < d_guiparams.length; p++)
		params[d_guiparams[p]] = i_wnd.m_elements[d_guiparams[p]].textContent;

	i_wnd.destroy();

	var job = {};
	//job.offline = true;
	job.name = params.filename;

	var block = {};
	block.name = 'Dailies';
	block.service = 'movgen';
	block.parser = 'generic';
	if( RULES.dailies.af_capacity ) block.capacity = RULES.dailies.af_capacity;
	block.working_directory = cgru_PM('/'+RULES.root+params.output);
	job.blocks = [block];

	var task = {}
	task.name = params.filename;
	task.command = d_MakeCmd( params);
	block.tasks = [task];

	n_SendJob( job);

	nw_MakeNews('<i>dailies</i>');
}

function d_MakeCmd( i_params)
{
	var input = cgru_PM('/'+RULES.root+i_params.input, true);
	var output = cgru_PM('/'+RULES.root+i_params.output+'/'+i_params.filename, true);

	var cmd = 'python';

	cmd += ' "'+cgru_PM( d_makemovie, true)+'"';

	cmd += ' -c "'+RULES.dailies.codec+'"';
	cmd += ' -f '+RULES.dailies.fps;
	cmd += ' -r '+RULES.dailies.resolution;
	cmd += ' -s '+RULES.dailies.slate;
	cmd += ' -t '+RULES.dailies.template;
	cmd += ' --lgspath "'+RULES.dailies.logo_slate_path+'"';
	cmd += ' --lgssize '+RULES.dailies.logo_slate_size;
	cmd += ' --lgsgrav '+RULES.dailies.logo_slate_grav;
	cmd += ' --lgfpath "'+RULES.dailies.logo_frame_path+'"';
	cmd += ' --lgfsize '+RULES.dailies.logo_frame_size;
	cmd += ' --lgfgrav '+RULES.dailies.logo_frame_grav;

	cmd += ' --project "'+ASSETS.project.name+'"';
	cmd += ' --shot "'+ASSETS.shot.name+'"';

	cmd += ' --ver "'+i_params.version+'"';
	cmd += ' --artist "'+i_params.artist+'"';
	cmd += ' --activity "'+i_params.activity+'"';

	cmd += ' "'+input+'"';
	cmd += ' "'+output+'"';

//python "/cgru/utilities/moviemaker/makemovie.py" -c "/cgru/utilities/moviemaker/codecs/photojpg_best.ffmpeg" -f 25 -n mov --fs 1 --fe 20 -r 720x576x1.09 -g 1.00 -s "dailies_slate" -t "dailies_withlogo" --project "ENCODE" --shot "preview" --ver "preview" --artist "Timurhai" --activity "comp" --tmpformat tga --lgspath "logo.png" --lgssize 25 --lgsgrav SouthEast --lgfpath "logo.png" --lgfsize 10 --lgfgrav North "/data/tools/encode/preview/preview.####.jpg" "/data/tools/encode/preview_preview_121226"

	return cmd;
}

function d_Explode( i_path)
{
	var params = {};
	params.quality = 5;
	params.resolution = -1;

	var wnd = new cgru_Window('dailes','Explode Movie');
	wnd.elContent.classList.add('dailies');

	wnd.m_elements = {};
	for( var p = 0; p < d_expguiparams.length; p++)
	{
		var name = d_expguiparams[p].name;
		var label = d_expguiparams[p].label;

		var elDiv = document.createElement('div');
		wnd.elContent.appendChild( elDiv);

		var elLabel = document.createElement('div');
		elDiv.appendChild( elLabel);
		elLabel.classList.add('label');
		if( label == null )
		{
			label = name;
			elLabel.style.textTransform = 'capitalize';
		}
		elLabel.textContent = label + ':';

		var elParam = document.createElement('div');
		elDiv.appendChild( elParam);
		elParam.classList.add('param');
		elParam.textContent = params[name];
		elParam.contentEditable = 'true';

		wnd.m_elements[name] = elParam;
	}

	var elBtns = document.createElement('div');
	wnd.elContent.appendChild( elBtns);

	var elSend = document.createElement('div');
	elBtns.appendChild( elSend);
	elSend.textContent = 'Explode';
	elSend.classList.add('button');
	elSend.onclick = function(e){ d_ExpProcessGUI( e.currentTarget.m_wnd);}
	elSend.m_wnd = wnd;

	wnd.m_path = i_path;
}

function d_ExpProcessGUI( i_wnd)
{
	var params = {};
	for( var p = 0; p < d_expguiparams.length; p++)
		params[d_expguiparams[p].name] = i_wnd.m_elements[d_expguiparams[p].name].textContent;

	var cmd = 'python utilities/moviemaker/mov2seq.py -t jpg';
	cmd += ' -a ' + RULES.avconv;
	cmd += ' -q ' + params.quality;
	if( params.resolution.length && ( params.resolution != '-1' ))
		cmd += ' -x ' + params.resolution;
	cmd += ' "' + cgru_PM('/' + RULES.root + i_wnd.m_path, true) + '"';

	n_Request({"cmdexec":{"cmds":[cmd]}}, true);

//	i_wnd.destroy();
//	window.location.reload();
}

