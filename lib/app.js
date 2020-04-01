URL = window.URL || window.webkitURL;

var gumStream; 
var rec;
var input; 
var vad_options;
var vad;


var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;


function enableRecording(){
    var constraints = { audio: true, video:false };
    try{
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

            audioContext = new AudioContext();

            gumStream = stream;

            input = audioContext.createMediaStreamSource(stream);

            rec = new Recorder(input,{numChannels:1});

            vad_options = {
              source: input,
              voice_stop: function() {
                  console.log('voice_stop');
                  document.getElementById("app_state").innerHTML="PAROU";
                  stopRecording();
              }, 
              voice_start: function() {
                  console.log('voice_start');
                  document.getElementById("app_state").innerHTML="GRAVANDO";
                  startRecording();
              }
            }; 

            vad = new VAD(vad_options);
            
            document.getElementById("app_state").innerHTML="FAVOR ASSOPRAR";

        }).catch(function(err) {

            console.error("ERROR!");

        });
    }catch(err2){
        document.getElementById("app_state").innerHTML="BROWSER NATIVO?";
        document.getElementById("nativeaudiobutton").click(); 
    }
}

function startRecording(){
    
    rec.record();
    
};

function stopRecording() {
    
    rec.stop();
    gumStream.getAudioTracks()[0].stop();
    
    rec.exportWAV(sendAudioToServer);
    
};

function sendAudioToServer(blob){
    console.log("recorded!");
    
    //TODO CONFIRM?
    
    var url = URL.createObjectURL(blob);
    
    var filename = new Date().toISOString();
    
    
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
      if(this.readyState === 4) {
          console.log("Server returned: ",e.target.responseText);
          document.getElementById("app_state").innerHTML="Guardado no Servidor";
      }
    };
    var fd=new FormData();
    fd.append("audio_data",blob, filename);
    xhr.open("POST","upload.php",true);
    xhr.send(fd);

};


