var consoleScrollbar;
var ipsScrollbar;
var actionsScrollbar;
//IPs
var ips = {
  "1.1.1.1":{
    known:false,
    openPorts:{
      80:{vulnerableTo:[0],port:80}
    },
    acceptsPing:true
  },
  "1.1.1.2":{
    known:false,
    openPorts:{
      80:{vulnerableTo:[0],port:80}
    },
    acceptsPing:true
  },
  "1.1.1.3":{
    known:false,
    openPorts:{
      80:{vulnerableTo:[0],port:80}
    },
    acceptsPing:true
  }
};
//Ready Function
$(document).ready(function() {
  consoleScrollbar = $("#console").niceScroll({cursorborderradius:0,background:"#222",cursoropacitymin:1,cursorwidth:10,smoothscroll:true,mousescrollstep:4}); 
  ipsScrollbar = $("#ips").niceScroll({cursorborderradius:0,background:"#222",cursoropacitymin:1,cursorwidth:10,smoothscroll:true,mousescrollstep:4}); 
  actionsScrollbar = $("#actions").niceScroll({cursorborderradius:0,background:"#222",cursoropacitymin:1,cursorwidth:10,smoothscroll:true,mousescrollstep:4}); 
  consoleScrollbar.doScrollTo(consoleScrollbar.getContentSize().h);
  actionsScrollbar.onResize(function(){
    $(".action").each(function( index ) {
      $(this).width($(this).height()*2);
    });
  });
  $(".action").each(function( index ) {
    $(this).width($(this).height()*2);
  });
  
  $("#ip-dialog-form").dialog({
    autoOpen: false,
    height: 180,
    width: 350,
    modal: true,
    buttons: {
      "Ping IP": function() {
        $( this ).dialog( "close" );
        continuePing();
      }
    },
    Cancel: function() {
      $( this ).dialog( "close" );
    }
  });
}); 
//Window Resize
function windowResize(){
  $(".action").each(function( index ) {
    $(this).width($(this).height()*2);
  });
}
//console
var console = {
  write:hddConsoleWrite
}
function hddConsoleWrite(text){
  $("#console").append("<p>"+text+"</p>");
  consoleScrollbar.doScrollTo(consoleScrollbar.getContentSize().h);
}
//Ping
function ping(){
  $("#ip-dialog-form").dialog("open");
}
function continuePing(){
  console.write("Pinging IP...");
  var ip = $("#ipIn").val();
  $("#ipIn").val("");
  if(ips[ip]){
    console.write("IP responded to ping in " + (Math.floor((Math.random() * 40) + 1) + 20) + "ms");
    if(!ips[ip].known){
      $("#ips").append(
        '<div class="ip" id="ip-'+ip+'">' +
          '<p>' + ip + ': </p>' +
          '<ul>' +
            '<li><a href="javascript:void(0);" class="ip-selector" id="ip-selector-'+convertIP(ip)+'" onclick="selectIP(\''+ip+'\')">Select</a></li>' +
          '</ul>' +
        '</div>'
      );
      console.write("IP unknown - Adding to IP list");
    }else{
      console.write("IP known - Not adding IP to list");
    }
    ips[ip].known = true;
  }else{
    console.write("Error: connection timed-out");
  }
  consoleScrollbar.doScrollTo(consoleScrollbar.getContentSize().h);
}
//portScan
function portScan(){
  if(findSelectedIP()){
    console.write('Scanning ' + findSelectedIP() + ' for open ports');
    for (i in ips[findSelectedIP()].openPorts){
      console.write('Found open port: ' + ips[findSelectedIP()].openPorts[i].port);
    }
  }else{
    console.write('Error: no target for scan');
  }
}
//Convert IP
function convertIP(ip){
  if(ip.indexOf('.') > 0){
    return ip.replace('.','-').replace('.','-').replace('.','-');
  }else{
    return ip.replace('-','.').replace('-','.').replace('-','.');
  }
}
//Select IP
function selectIP(ip){
  if($('#ip-selector-' + convertIP(ip)).html() == 'Select'){
    $('.ip-selector').each(function(){
      $(this).html('Select');
    });
    $('#ip-selector-' + convertIP(ip)).html('Deselect');
  }else{
    $('#ip-selector-' + convertIP(ip)).html('Select');
  }
}
//Find selected IP
function findSelectedIP(){
  var returned = false;
  $('.ip-selector').each(function(){
    if($(this).html() == 'Deselect'){
      returned = convertIP($(this).attr('id').replace('ip-selector-',''));
    }
  });
  return returned;
}