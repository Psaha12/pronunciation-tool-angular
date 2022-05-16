import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AudioRecordingService } from './audio-recording.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PronunciationService } from './pronunciation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {


  ngOnInit(): void {
  }
  isPlaying = false;
  displayControls = true;
  isAudioRecording = false;
  displayAudioRecording = false;
  audioRecordedTime: any;
  audioBlobUrl: SafeUrl | null | undefined;
  audioBlob: any;
  audioName: any;
  audioStream: any;
  @Input() uid : string ="";
  @Input() name : string ="";
  audioConf = { audio: true}
  audioTypeSelected=1;


  constructor(
    private ref: ChangeDetectorRef,
    private audioRecordingService: AudioRecordingService,
    private pronunciationService:PronunciationService,
    private sanitizer: DomSanitizer
  ) {

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isAudioRecording = false;
      this.ref.detectChanges();
 });

    this.audioRecordingService.getRecordedTime().subscribe((time: any) => {
      this.audioRecordedTime = time;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data: { blob: Blob | MediaSource; title: string | undefined; }) => {
      this.audioBlob = data.blob;
      this.audioName = data.title;
      pronunciationService.callSaveNonStandardPronunciationAudio(this.uid ,this.name,this.audioBlob ,this.audioName);
      this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.ref.detectChanges();
    });
  };

  updateName(newName: any){
    this.name = newName.target.value;
  }

  updateUid(newUid: any){
    this.uid = newUid.target.value;
  }

  resetAudioOptions(event:any){
    this.isAudioRecording = false;
    this.audioBlobUrl = null;
    this.displayAudioRecording=false;
  }
  startAudioRecording() {
    if (!this.isAudioRecording) {
      this.isAudioRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortAudioRecording() {
    if (this.isAudioRecording) {
      this.isAudioRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopAudioRecording() {
    if (this.isAudioRecording) {
      this.audioRecordingService.stopRecording();
      this.isAudioRecording = false;
    }
  }

  clearAudioRecordedData() {
    this.audioBlobUrl = null;
  }

  downloadAudioRecordedData() {
    this._downloadFile(this.audioBlob, 'audio/mp3', this.audioName);
  }

  ngOnDestroy(): void {
    this.abortAudioRecording();
  }

  _downloadFile(data: any, type: string, filename: string): any {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  callPronunciationServiceToGetAudio(api :string){
    
    this.pronunciationService.callPronunciationApiToGetAudio(this.uid,this.name,api).subscribe(
      data => {
        const blob = new Blob([data], {
          type: 'audio/wav'
      });
      if(data.byteLength > 0 ){
        this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        this.isAudioRecording=false;
        this.displayAudioRecording = false;
        this.ref.detectChanges();
      }else{
        this.isAudioRecording=false;
        this.displayAudioRecording = true;
        this.audioBlobUrl=false
      }   
      }
    );
  }

  onSubmit(){
    if(this.audioTypeSelected ==1){
      this.callPronunciationServiceToGetAudio('/getStandardPronunciation');
    }else{
      this.callPronunciationServiceToGetAudio('/getNonStandardPronunciation');
    }
  }

}
