import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PronunciationService {

  private PRONUNCIATION_API = "https://pronunciation-tool-backend.azurewebsites.net/";
  
  constructor(private httpClient: HttpClient) { }

  callSaveNonStandardPronunciationAudio(uid : string ,name : string ,audio : Blob , audioName : string){
    const audioFile = new File([audio], audioName);
    var formData: any = new FormData();
    formData.append("uid", uid);
    formData.append("name", name);
    formData.append("file", audioFile ,audioFile.name);
    return this.httpClient.post(this.PRONUNCIATION_API + '/saveNonStandardPronunciation' , formData).subscribe(
    (response) => console.log(response),
    (error) => console.log(error) 
  )
  }

  callPronunciationApiToGetAudio(uid : string ,name : string ,api :string){
    var formData: any = new FormData();
    formData.append("uid", uid);
    formData.append("name", name);
    return this.httpClient.post(this.PRONUNCIATION_API + api , formData ,{
      responseType: 'arraybuffer'}).pipe(map((response : any) => {
      return response;
    }));
  }
}
