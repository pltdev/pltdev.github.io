  //Ensure jquery is loaded
if ( typeof jQuery === 'undefined' )
  alert("Spokes Error: jQuery must be loaded before spokes Javascript");

  //Compresses an array of queue items down to a single number
function compressQueueList( queue )
{
  var val = 0;

    //If we aren't an array, just return queue
  if ( queue.constructor.toString().indexOf("Array") == -1 )
    return queue;

    //We have an array, go through it and or everthing together
  for ( var i = 0; i < queue.length; i++ )
    if ( typeof( queue[i] ) === "number" && queue[i] > 0 )
      val |= queue[i];

  return val;
}

  //This is an action object which provides callbacks if the server is offline
function SpokesAction( callback )
{
  this.Age = 0;
  this.Callback = callback;
  this.isValid = true;
}
  //Holds a list actions for all objects
SpokesAction.Action_List = new Array();

//Register myself with the allocated list of spokes
setInterval(function () { 
    var len = SpokesAction.Action_List.length - 1;
    for ( var i = len; i >= 0; i-- ) {
      var action = SpokesAction.Action_List[i];
      action.Age++;
      // action.Age++;
      if ( action.Age > 4 ){
        SpokesAction.Action_List.splice(i,1); 
          //Call the user telling them the request timed out
        if ( action.isValid && typeof( action.Callback) === 'function' )
          action.Callback( new SpokesResponse( {"Description":"","Err":{"Description":"No response.  Server appears to be offline.","Error_Code":0,"Type":4},"Result":null,"Type":0,"Type_Name":"Unknown","isError":true} ) );

      }
    }
}, 2000); //2 seconds on the callback


  //Create my object
function Spokes( url ) {
  // set path to default if url is undefined
  this.Path = (typeof url === 'undefined' || url == null) ? "https://127.0.0.1:32018" : url;  //Custom address
  this.Device = new Device( this.Path ); 
  this.Plugin = new Plugin( this.Path );
  this.UserPreference = new UserPreference( this.Path);
}

  //Create my object
function Device( path )
{
  this.Path = path;
  this.Device_Id = "";
  this.Sess_Id = "";
  this.isAttached = false;
}

  //Connect to a device
Device.prototype.attach = function( uid, callback )
{
  //  //Change the uid to a special value if none was given
  //if ( callback == undefined && typeof(uid) === "function" )
  //{
  //  callback = uid;
  //  uid = "0123456789"; //Magic uid which tells server to pick first device 
  //}

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  local = this;
  $.getJSON(this.Path + "/DeviceServices/Attach?uid="+ uid +"&callback=?", 
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.SessionHash )
                resp.isValid = false;

                //Store my session and set that we are attached
              if ( resp.isValid && !resp.isError )
              {
                local.Sess_Id = resp.Result;
                local.isAttached = true;   
              }

                //Pass my result back to the user
              action.isValid = false;
              if ( typeof( action.Callback ) === 'function' )
                action.Callback( resp ); 
            } );

  return true;
}

  //Release my session from a device
Device.prototype.release = function( callback )
{
    //Can't release, we aren't attached
  if ( this.isAttached == false )
    return false;

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  local = this;
    //Release a session
  $.getJSON(this.Path+"/DeviceServices/Release?sess="+ this.Sess_Id +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Set that we aren't attached anymore, if if this failed
              local.Sess_Id = "";
              local.isAttached = false;   

                //Pass my result back to the user
              action.isValid = false;
              if ( typeof(action.Callback) === 'function' )
                action.Callback( resp ); 
            } );

  return true;
}

  //Returns the info for our connected device
Device.prototype.deviceInfo = function( callback )
{
    //Can't release, we aren't attached
  if ( callback == null || callback == undefined )
    return false;

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  local = this;
  $.getJSON(this.Path+"/DeviceServices/Info?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.DeviceInfo )
                resp.isValid = false;

                //Store my device uid
              if ( resp.isValid && !resp.isError )
              {
                local.Device_Id = resp.Result.Uid;
              }

                //Pass my result back to the user
              action.isValid = false;
              if (action.Callback != null && action.Callback != undefined)
                  action.Callback(resp); 
            } );

  return true;
}

Device.prototype.atdMobileCallerId = function( callback )
{
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  $.getJSON(this.Path + "/DeviceServices/ATDMobileCallerId?sess=" + this.Sess_Id + "&callback=?", 
            function(data)
            { 
              //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.String )
                resp.isValid = false;

              //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp );
            } );

  return true;
}

Device.prototype.proximity = function(enabled, callback )
{
  if ( typeof(enabled) !== "boolean" )
    return false;

  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  $.getJSON(this.Path + "/DeviceServices/Proximity?sess=" + this.Sess_Id + "&enabled=" + enabled + "&callback=?", 
            function(data)
            { 
              //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.String )
                resp.isValid = false;

              //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp );
            } );

  return true;
}

  //Returns all the valid events that have happened since last call
Device.prototype.events = function( queue, callback )
{
    //Check if I was only given one argument
  if ( callback == undefined && typeof( queue ) === 'function' )
  {
    callback = queue;
    queue = 0;
  }

    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Can't release, we aren't attached
  if ( callback == null || callback == undefined )
    return false;

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/DeviceServices/Events?sess="+ this.Sess_Id +"&queue="+ queue +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.DeviceEventArray )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if (action.Callback != null && action.Callback != undefined)
                  action.Callback(resp); 
            });

  return true;
}

  //Returns specific event queues
Device.prototype.headsetEvents = function( callback )
{
  var evt = (SpokesEventType.HeadsetButtonPressed | 
             SpokesEventType.HeadsetStateChange);
  return this.events( evt, callback );
}

  //Returns specific event queues
Device.prototype.baseEvents = function( callback )
{
  var evt = (SpokesEventType.BaseButtonPressed |
             SpokesEventType.BaseStateChange);
  return this.events( evt, callback );
}

  //Returns specific event queues
Device.prototype.atdEvents = function( callback )
{
  return this.events( SpokesEventType.ATDStateChange, callback );
}

  //Starts or stops the ringer in the headest
Device.prototype.ring = function( enabled, callback )
{
    //Can't release, we aren't attached
  if ( typeof(enabled) !== "boolean" )
    return false;

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/DeviceServices/Ring?enabled="+ enabled +
                                          "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Sets the audio state, for wireless headsets MonoOn/Off turns them on and off
Device.prototype.audioState = function( state, callback )
{
    //Can't release, we aren't attached
  if ( typeof(state) !== "number" )
    return false;

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Convert the audio state into the textual name
  state = SpokesAudioType.Lookup[state];

    //Register a session
  $.getJSON(this.Path+"/DeviceServices/AudioState?state="+ state +
                                          "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
/////////////////////////////////////////////////
// EventManager

  //Returns the queues we are registered for
Device.prototype.getEventRegistry = function( callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/GetRegistry?sess="+ this.Sess_Id +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Defines a list of queues we are registred for
Device.prototype.setEventRegistry = function (queue, callback)
{
    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/SetRegistry?sess="+ this.Sess_Id +"&queue=" + queue +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Adds a list of queues from our registry
Device.prototype.addEventRegistry = function (queue, callback)
{
    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/AddRegistry?sess="+ this.Sess_Id +"&queue=" + queue +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Removes a list of queues from our registry
Device.prototype.removeEventRegistry = function (queue, callback)
{
    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/RemoveRegistry?sess="+ this.Sess_Id +"&queue=" + queue +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Sets the time to live for all event queue messages
Device.prototype.setGlobalTTL = function( ttl, callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/GlobalTTL?sess="+ this.Sess_Id +"&ttl="+ ttl +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Sets the max number of events per queue, for all queues
Device.prototype.setGlobalMaxEvents = function( max, callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/GlobalMaxCount?sess="+ this.Sess_Id +"&max="+ max +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Sets the time to live for a list of queues
Device.prototype.setQueueTTL = function( queue, ttl, callback )
{

    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/TTL?sess="+ this.Sess_Id +"&queue="+ queue +
                                            "&ttl="+ ttl +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Sets the max number of events per queue, for the list of queues given
Device.prototype.setQueueMaxEvents = function( queue, max, callback )
{
    //If they gave me an array of queue items, compress them down to an int
  queue = compressQueueList( queue );

    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/EventManager/MaxCount?sess="+ this.Sess_Id +"&queue="+ queue +
                                            "&max="+ max +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Integer )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
//Define CallState
function SessionCallState() {}
SessionCallState.Unknown            = 0;
SessionCallState.AcceptCall         = 1;
SessionCallState.TerminateCall      = 2;
SessionCallState.HoldCall           = 3;
SessionCallState.Resumecall         = 4;
SessionCallState.Flash              = 5;
SessionCallState.CallInProgress     = 6;
SessionCallState.CallRinging        = 7;
SessionCallState.CallEnded          = 8;
SessionCallState.TransferToHeadSet  = 9;
SessionCallState.TransferToSpeaker  = 10;
SessionCallState.MuteON             = 11;
SessionCallState.MuteOFF            = 12;
SessionCallState.MobileCallRinging  = 13;
SessionCallState.MobileCallInProgress = 14;
SessionCallState.MobileCallEnded    = 15;
SessionCallState.Don                = 16;
SessionCallState.Doff               = 17;
SessionCallState.CallIdle           = 18;
SessionCallState.Play               = 19;
SessionCallState.Pause              = 20;
SessionCallState.Stop               = 21;
SessionCallState.DTMFKey            = 22;
SessionCallState.RejectCall         = 23;

SessionCallState.Lookup = Array();
SessionCallState.Lookup[SessionCallState.Unknown] = "Unknown";
SessionCallState.Lookup[SessionCallState.AcceptCall] = "AcceptCall";
SessionCallState.Lookup[SessionCallState.TerminateCall] = "TerminateCall";
SessionCallState.Lookup[SessionCallState.HoldCall] = "HoldCall";
SessionCallState.Lookup[SessionCallState.Resumecall] = "Resumecall";
SessionCallState.Lookup[SessionCallState.Flash] = "Flash";
SessionCallState.Lookup[SessionCallState.CallInProgress] = "CallInProgress";
SessionCallState.Lookup[SessionCallState.CallRinging] = "CallRinging";
SessionCallState.Lookup[SessionCallState.CallEnded] = "CallEnded";
SessionCallState.Lookup[SessionCallState.TransferToHeadSet] = "TransferToHeadSet";
SessionCallState.Lookup[SessionCallState.TransferToSpeaker] = "TransferToSpeaker";
SessionCallState.Lookup[SessionCallState.MuteON] = "MuteON";
SessionCallState.Lookup[SessionCallState.MuteOFF] = "MuteOFF";
SessionCallState.Lookup[SessionCallState.MobileCallRinging] = "MobileCallRinging";
SessionCallState.Lookup[SessionCallState.MobileCallInProgress] = "MobileCallInProgress";
SessionCallState.Lookup[SessionCallState.MobileCallEnded] = "MobileCallEnded";
SessionCallState.Lookup[SessionCallState.Don] = "Don";
SessionCallState.Lookup[SessionCallState.Doff] = "Doff";
SessionCallState.Lookup[SessionCallState.CallIdle] = "CallIdle";
SessionCallState.Lookup[SessionCallState.Play] = "Play";
SessionCallState.Lookup[SessionCallState.Pause] = "Pause";
SessionCallState.Lookup[SessionCallState.Stop] = "Stop";
SessionCallState.Lookup[SessionCallState.DTMFKey] = "DTMFKey";
SessionCallState.Lookup[SessionCallState.RejectCall] = "RejectCall";
  //Define all the audio states that exist
function SpokesAudioType() {}
SpokesAudioType.MonoOn        = 1;       
SpokesAudioType.MonoOff       = 2;
SpokesAudioType.StereoOn      = 3;
SpokesAudioType.StereoOff     = 4;
SpokesAudioType.MonoOnWait    = 5;
SpokesAudioType.StereoOnWait  = 6;

  //Create a lookup for the textual names of the enum
SpokesAudioType.Lookup = Array();
SpokesAudioType.Lookup[SpokesAudioType.MonoOn] = "MonoOn";
SpokesAudioType.Lookup[SpokesAudioType.MonoOff] = "MonoOff";
SpokesAudioType.Lookup[SpokesAudioType.StereoOn] = "StereoOn";
SpokesAudioType.Lookup[SpokesAudioType.StereoOff] = "StereoOff";
SpokesAudioType.Lookup[SpokesAudioType.MonoOnWait] = "MonoOnWait";
SpokesAudioType.Lookup[SpokesAudioType.StereoOnWait] = "StereoOnWait";

  //Define my response types
function SpokesResponseType() {}
SpokesResponseType.Unknown             = 0;
SpokesResponseType.Error               = 1;
SpokesResponseType.Bool                = 2;
SpokesResponseType.Integer             = 3;
SpokesResponseType.DeviceInfo          = 4;
SpokesResponseType.DeviceInfoArray     = 5;
SpokesResponseType.DeviceEventArray    = 6;
SpokesResponseType.SessionHash         = 7;
SpokesResponseType.String              = 8;
SpokesResponseType.CallManagerState    = 9;
SpokesResponseType.CallStateArray      = 10;
SpokesResponseType.ContactArray        = 11;
SpokesResponseType.StringArray         = 12;

  //Define my response class
function SpokesResponse( obj ) 
{
    //Copy the JSON data into this object
  this.Type         = obj["Type"];
  this.Type_Name    = obj["Type_Name"];
  this.Description  = obj["Description"];
  this.isError      = obj["isError"];
  this.isValid      = true;
  this.Err          = null;
  this.Result       = null;

    //If we have an error, null the result and populate error, else opposite
  if ( this.isError )
  {
    this.Err = new SpokesError( obj["Err"] );
    return;
  }

    //Store a user result object
  switch ( this.Type )
  {
      //Object types that js knowns about
    case SpokesResponseType.Bool:
    case SpokesResponseType.Integer:
    case SpokesResponseType.SessionHash:
    case SpokesResponseType.String:
    case SpokesResponseType.CallManagerState:
      this.Result = obj["Result"];
      break;

      //Create a device info object
    case SpokesResponseType.DeviceInfo:
      this.Result = new SpokesDeviceInfo( obj["Result"] );
      break;

      //Create an array of device info objects
    case SpokesResponseType.DeviceInfoArray:
        //Store my json array and get my result ready to handle data
      var ary = obj["Result"];
      this.Result = new Array();

        //Craete device info objects and store them
      for ( var i = 0; i < ary.length; i++ )
        this.Result[i] = new SpokesDeviceInfo( ary[i] );
      break;

      //Store an array of events
    case SpokesResponseType.DeviceEventArray:
        //Store my json array and get my result ready to handle data
      var ary = obj["Result"];
      this.Result = new Array();

        //Craete device info objects and store them
      for ( var i = 0; i < ary.length; i++ )
        this.Result[i] = new SpokesEvent( ary[i] );
      break;

      //Returns an array of call states
    case SpokesResponseType.CallStateArray:
    case SpokesResponseType.StringArray:
        //Store my json array and get my result ready to handle data
      var ary = obj["Result"];
      this.Result = new Array();

        //Craete device info objects and store them
      for ( var i = 0; i < ary.length; i++ )
        this.Result[i] = ary[i];
      break;

      //Returns an array of contact arrays
    case SpokesResponseType.ContactArray:
        //Store my json array and get my result ready to handle data
      var ary = obj["Result"];
      this.Result = new Array();

        //Craete device info objects and store them
      for ( var i = 0; i < ary.length; i++ )
        this.Result[i] = new SpokesContact( ary[i] );
      break;

    default:
      alert("Invalid object type sent");
      break;
  }
}

  //Creates an device info instance
function SpokesDeviceInfo( obj )
{
  this.Uid              = obj["Uid"];
  this.DevicePath       = obj["DevicePath"];
  this.InternalName     = obj["InternalName"];
  this.IsAttached       = obj["IsAttached"];
  this.ManufacturerName = obj["ManufacturerName"];
  this.ProductId        = obj["ProductId"];
  this.ProductName      = obj["ProductName"];
  this.SerialNumber     = obj["SerialNumber"];
  this.VendorId         = obj["VendorId"];
  this.VersionNumber    = obj["VersionNumber"]; //for backward compatibility
  this.USBVersionNumber         = obj["USBVersionNumber"];
  this.BaseFirmwareVersion      = obj["BaseFirmwareVersion"];
  this.BluetoothFirmwareVersion = obj["BluetoothFirmwareVersion"];
  this.RemoteFirmwareVersion    = obj["RemoteFirmwareVersion"];
  this.BaseSerialNumber         = obj["BaseSerialNumber"];
  this.HeadsetSerialNumber      = obj["HeadsetSerialNumber"];
}

  //Stores the spokes event types that can exist
function SpokesEventType() {}
SpokesEventType.DeviceStateChange       = 1;
SpokesEventType.HeadsetStateChange      = 2;
SpokesEventType.HeadsetButtonPressed    = 4;
SpokesEventType.BaseStateChange         = 8;
SpokesEventType.BaseButtonPressed       = 16;
SpokesEventType.CallStateChange         = 32;
SpokesEventType.ATDStateChange          = 64;

  //Creates a device event instance
function SpokesEvent( obj )
{
  this.Event_Log_Type_Name  = obj["Event_Log_Type_Name"];
  this.Event_Log_Type_Id    = obj["Event_Log_Type_Id"];
  this.Event_Name           = obj["Event_Name"];
  this.Event_Id             = obj["Event_Id"];
  this.Timestamp            = obj["Timestamp"];
  this.Age                  = obj["Age"];
}

  //Defines a spokes error
function SpokesErrorType() {}
SpokesErrorType.Unknown         = 0;
SpokesErrorType.Invalid_Uid     = 1;
SpokesErrorType.Exception       = 2;
SpokesErrorType.Invalid_Session = 3;
SpokesErrorType.Server_Offline  = 4;

  //Creates a spokes error object
function SpokesError( obj )
{
  this.Type = obj["Type"];
  this.Description = obj["Description"];
  this.Error_Code = obj["Error_Code"];
}

  //Returns a spokes contact
function SpokesContact( obj )
{
  this.Id = obj["Id"];
  this.Name = obj["Name"];
  this.Email = obj["Email"];
  this.Phone = obj["Phone"];
  this.SipUri = obj["SipUri"];
  this.WorkPhone = obj["WorkPhone"];
  this.HomePhone = obj["HomePhone"];
  this.MobilePhone = obj["MobilePhone"];
  this.FriendlyName = obj["FriendlyName"];
}

  //A callId Object
function SpokesCallId( obj )
{
  this.Id = obj["Id"];
  this.InConference = obj["InConference"];
  this.ConferenceId = obj["ConferenceId"];
}

/////////////////////////////////////////////////////
// SessionManager

// Plugin
function Plugin( path )
{
  this.Path = path;
  this.Sess_Id = "";
  this.isAttached = false;
}

  //List out all plugins
Plugin.prototype.pluginList = function( callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/SessionManager/PluginList?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.StringArray )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Register a plugin
Plugin.prototype.register = function( name, callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/SessionManager/Register?name="+ name +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Unregister a plugin
Plugin.prototype.unRegister = function( name, callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/SessionManager/UnRegister?name="+ name +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

  //Set that the plugin is active
Plugin.prototype.isActive = function( name, active, callback )
{
    //Register the callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path+"/SessionManager/IsActive?name="+ name +
                "&active="+ active +
                "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
/////////////////////////////////////
// Call services

//callManagerState
Plugin.prototype.callManagerState = function(callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/CallServices/CallManagerState?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.CallManagerState )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
// session events
Plugin.prototype.sessionEvents = function(callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/CallServices/Events?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.StringArray  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
// call call events
Plugin.prototype.sessionCallEvents = function( name, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/CallServices/SessionManagerCallEvents?name="+ name +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.StringArray  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// callEvents
Plugin.prototype.callEvents = function( name, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/CallServices/CallEvents?name="+ name +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.CallStateArray  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// callRequests 
Plugin.prototype.callRequests = function( name, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

    //Register a session
  $.getJSON(this.Path + "/CallServices/CallRequests?name="+  name +"&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.ContactArray  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
// TODO: RingTone, AudioRoute
// incomingCall
Plugin.prototype.incomingCall = function( name, callID, contact, tones, route, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  if( callID.getName() != "SpokesCallId" || contact.getName() != "SpokesContact" )
    return false;
  
  callID = JSON.stringify(callID); 
  contact = JSON.stringify(contact); 
    //Register a session
  $.getJSON(this.Path + "/CallServices/IncomingCall?name=" + name + 
                                            "&callID=" + callID +
                                            "&contact="+ contact +
                                            "&tones="+ tones +
                                            "&route="+ route +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
// todo: AudioRoute
// outgoingCall
Plugin.prototype.outgoingCall = function( name, callID, contact,  route, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  if( callID.getName() != "SpokesCallId" || contact.getName() != "SpokesContact" )
    return false;
  
  callID = JSON.stringify(callID); 
  contact = JSON.stringify(contact); 
  
    //Register a session
  $.getJSON(this.Path + "/CallServices/OutgoingCall?name=" + name +
                                            "&callID=" + callID +
                                            "&contact="+ contact +
                                            "&route="+ route +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// terminateCall
Plugin.prototype.terminateCall = function( name, callID, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/TerminateCall?name=" + name + 
                                            "&callID=" + callID +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// answerCall
Plugin.prototype.answerCall = function( name, callID, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/AnswerCall?name=" + name +
                                            "&callID=" + callID +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// holdCall
Plugin.prototype.holdCall = function( name, callID, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/HoldCall?name=" + name +
                                            "&callID=" + callID +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// resumeCall
Plugin.prototype.resumeCall = function( name, callID, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/ResumeCall?name=" + name +
                                            "&callID=" + callID +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}


// muteCall
Plugin.prototype.muteCall = function( name, muted, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
    //Register a session
  $.getJSON(this.Path + "/CallServices/MuteCall?name=" + name +
                                            "&muted=" + muted +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// insertCall
Plugin.prototype.insertCall = function( name, callID, contact, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" || contact.getName() != "SpokesContact" )
    return false;
  
  callID = JSON.stringify(callID); 
  contact = JSON.stringify(contact); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/InsertCall?name=" + name +
                                            "&callID=" + callID +
                                            "&contact=" + contact +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
// todo: AudioRoute
// setAudioRoute
Plugin.prototype.setAudioRoute = function( name, callID, route, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/SetAudioRoute?name=" + name + 
                                            "&callID=" + callID +
                                            "&route=" + route +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// setConferenceId
Plugin.prototype.setConferenceId = function( name, callID, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );
  
  if( callID.getName() != "SpokesCallId" )
    return false;
  
  callID = JSON.stringify(callID); 

    //Register a session
  $.getJSON(this.Path + "/CallServices/SetConferenceId?name=" + name +
                                            "&callID=" + callID +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

// makeCall
Plugin.prototype.makeCall = function( name, contact, callback )
{
    //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  if( contact.getName() != "SpokesContact" )
    return false;
  
  contact = JSON.stringify(contact); 
    //Register a session
  $.getJSON(this.Path + "/CallServices/MakeCall?name=" + name +
                                            "&contact=" + contact +
                                            "&callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.Bool  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}
var getName = function() { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((this).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};
SpokesCallId.prototype.getName = getName;
SpokesContact.prototype.getName = getName;

/////////////////////////////////////////////////////
// UserPreference

// UserPref
function UserPreference( path )
{
  this.Path = path;
}

//GetDefaultSoftPhone
UserPreference.prototype.getDefaultSoftphone = function (callback)
{
      //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );

  
  $.getJSON(this.Path + "/UserPreference/GetDefaultSoftPhone?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.String  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

//getEscalateToVoiceSoftPhone
UserPreference.prototype.getEscalateToVoiceSoftPhone = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetEscalateToVoiceSoftPhone?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.String)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getMediaPlayerActionIncomingCall
UserPreference.prototype.getMediaPlayerActionIncomingCall = function (callback)
{
  //Register callback
  var action = new SpokesAction( callback );
  SpokesAction.Action_List.unshift( action );


  $.getJSON(this.Path + "/UserPreference/GetMediaPlayerActionIncomingCall?callback=?",
            function(data)
            { 
                //Create a nice object, and ensure its of the right type
              var resp = new SpokesResponse( data );
              if ( resp.Type != SpokesResponseType.String  )
                resp.isValid = false;

                //Pass my result back to the user
              action.isValid = false;
              if ( action.Callback != null && action.Callback != undefined )
                action.Callback( resp ); 
            } );

  return true;
}

//getMediaPlayerActionEndedCall
UserPreference.prototype.getMediaPlayerActionEndedCall = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetMediaPlayerActionEndedCall?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.String)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getAutoPresence
UserPreference.prototype.getAutoPresence = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetAutoPresence?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getDoffAction
UserPreference.prototype.getDoffAction = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetDoffAction?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.String)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getDonAction
UserPreference.prototype.getDonAction = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetDonAction?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.String)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getKeepLinkUp
UserPreference.prototype.getKeepLinkUp = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetKeepLinkUp?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//getRingPCAndHS
UserPreference.prototype.getRingPCAndHS = function (callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/GetRingPCAndHS?callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetDefaultSoftPhone
UserPreference.prototype.setDefaultSoftphone = function (name, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetDefaultSoftPhone?name="+ name + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetEscalateToVoiceSoftPhone
UserPreference.prototype.setEscalateToVoiceSoftPhone = function (name, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetEscalateToVoiceSoftPhone?name=" + name + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetMediaPlayerActionIncomingCall
UserPreference.prototype.setMediaPlayerActionIncomingCall = function (actionIncoming, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetMediaPlayerActionIncomingCall?actionIncoming=" + actionIncoming + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetMediaPlayerActionEndedCall
UserPreference.prototype.setMediaPlayerActionEndedCall = function (actionEnded, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetMediaPlayerActionEndedCall?actionEnded=" + actionEnded + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetAutoPresence
UserPreference.prototype.setAutoPresence = function (autoPresence, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetAutoPresence?autoPresence=" + autoPresence + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetDoffAction
UserPreference.prototype.setDoffAction = function (doffAction, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetDoffAction?doffAction=" + doffAction + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetDonAction
UserPreference.prototype.setDonAction = function (donAction, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetDonAction?donAction=" + donAction + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetKeepLinkUp
UserPreference.prototype.setKeepLinkUp = function (keepLinkUp, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetKeepLinkUp?keepLinkUp=" + keepLinkUp + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}

//SetRingPCAndHS
UserPreference.prototype.setRingPCAndHS = function (ringPcAndHS, callback) {
    //Register callback
    var action = new SpokesAction(callback);
    SpokesAction.Action_List.unshift(action);


    $.getJSON(this.Path + "/UserPreference/SetRingPCAndHS?ringPcAndHS=" + ringPcAndHS + "&callback=?",
              function (data) {
                  //Create a nice object, and ensure its of the right type
                  var resp = new SpokesResponse(data);
                  if (resp.Type != SpokesResponseType.Bool)
                      resp.isValid = false;

                  //Pass my result back to the user
                  action.isValid = false;
                  if (action.Callback != null && action.Callback != undefined)
                      action.Callback(resp);
              });

    return true;
}
