var map, pointarray, heatmap;

var SignalData = [];

// for handling reloads
window.onload = function()
{
    openSocket();
    //fetch_signal_data();
    initialize();
};

// fetches all signal data
function fetch_signal_data()
{
    var req = new XMLHttpRequest();
    req.open('GET', '/fetch_signal_data',true);

    req.onload = function ()
    {
        if (req.status === 200)
        {
            console.log('all done: ' + req.status);

            var data = JSON.parse(req.responseText);

            // checks if the upload was successful                                                                                                                                                                   
            if(data.success && data.data != null)
            {
             
                var data = data.data;
                    
                for (var i = 0; i < data.length; ++i)
		{
			SignalData.push(new google.maps.LatLng(data[i][0],data[i][1]));
                }

                toggleHeatmap();
                toggleHeatmap();
            }
            else
            {
                // this should not happen                                                                                                                                                                                
                console.log('Something went terribly wrong...');
            }
	}

    };
    
    req.open('GET', '/fetch_signal_data',true);
    req.send();

}

// Opens a websocket for the user
function openSocket()
{
    if ( "WebSocket" in window )
    {
        var ws = new WebSocket("ws://" + document.domain + ":80/persistant_connection");
//	var heartbeat_msg = '--heartbeat--', heartbeat_interval = null
	var missed_heartbeats = 0;
	console.log('Created WebSocket');
	ws.onopen = function()
	{
	    console.log('opening a websocket');
/*	    
	    if (heartbeat_interval === null) {
        	missed_heartbeats = 0;
        	heartbeat_interval = setInterval(function() {
            		try {
                		missed_heartbeats++;
                		if (missed_heartbeats >= 10)
                    			throw new Error("Too many missed heartbeats.");
                		ws.send(heartbeat_msg);
            		} catch(e) {
                		clearInterval(heartbeat_interval);
                		heartbeat_interval = null;
                		console.warn("Closing connection. Reason: " + e.message);
                		ws.close();
            			}
            	}, 5000);
    	    }
*/
	    console.log('Done with onOpen()');
	};

	ws.onerror = function(error)
	{
	    console.log('WebSocket Error ' + error);
	};

	ws.onclose = function() 
	{ 
	    ws.send('close'); 
	    console.log('WebSocket Closed');
	};
	console.log(ws);
	
        // receives messages from the server as JSON
	ws.onmessage = function(evt)
	{
	    var received_data = JSON.parse(evt.data);
            console.log('Server: ' + received_data.message);

            // if terminated message is received from the server we send that we confirm that the message has been received, which in turn closes the socket
	    if(received_data.message === 'terminate')
	    {
                ws.close();
                console.log('server said close');
	    }
	   else if (received_data.message === "--heartbeat--") 
	    {
        	// reset the counter for missed heartbeats
        	missed_heartbeats = 0;
    	    }
            else if (received_data.message === 'Found data')
            {
                console.log("Got new entries through websocket with data");
                var data = received_data.data;
                for (var i = 0; i < data.length; ++i)
                {
                    // get longitude and latitude
                    SignalData.push(new google.maps.LatLng(data[i][0],data[i][1]));
                }
                toggleHeatmap();
                toggleHeatmap();
            }
	};
    }
    else
    {
	console.log("Browser does not support HTML5 WebSockets, please download a proper browser!");
    }

}


function initialize()
{

    var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(58.3991, 15.5772),
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var pointArray = new google.maps.MVCArray(SignalData);

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: pointArray
  });

  heatmap.setMap(map);
}

function toggleHeatmap()
{
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient()
{
  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius()
{
  heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity()
{
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

google.maps.event.addDomListener(window, 'load', initialize);
