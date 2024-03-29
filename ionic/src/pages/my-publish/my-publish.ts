import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';


/**
 * Generated class for the MyPublishPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-publish',
  templateUrl: 'my-publish.html',
})
export class MyPublishPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http:Http,
    public alertCtrl:AlertController
  ) {
  }

  publish = []

  ionViewDidLoad() {

    this.http.get('http://localhost:7000/api/v1/content/',{}).subscribe(data=>{
      this.publish = JSON.parse(data['_body']).data;
      // console.log(this.publish.length)

      //昵称转换author-->username
      for (let i = 0; i < this.publish.length; i++) {
        let id = this.publish[i].author
        let token = localStorage.getItem('user_token')
        this.http.get('http://localhost:7000/api/v1/user/' + id + '?token=' + token
          , {}).subscribe(data => {
            this.publish[i].name = JSON.parse(data['_body']).data.name
            this.publish[i].icon = 'assets/imgs/user.jpg'
            this.publish[i].created = this.timeTotime(this.publish[i].created)
          }, err => {
            console.log(err);
          });

          //content内容显示
          let _id = this.publish[i]._id
          this.http.get('http://localhost:7000/api/v1/content/' + _id, {}).subscribe(data => {
            this.publish[i].content = JSON.parse(data['_body']).data.content
        
          }, err => {
            console.log(err);
          });
          
      }
      for (let i = 0; i < this.publish.length; i++) {
        if (this.publish[i].author == localStorage.getItem('user_id')) {
          this.myPublish.unshift(this.publish[i])
        }
      }

      // console.log(this.myPublish);
    })
  }

  myPublish = [
    // {icon:'assets/publish/mht.jpg',name:'Ma',created:'2018-6-1',pic:'assets/publish/main.jpg',title:'我发布的',comments:'3',up:'3'}
  ]
  

  del(id){
    const confirm = this.alertCtrl.create({
      title: '确定删除吗?',
      message: '',
      buttons: [
        {
          text: '取消',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: '同意',
          handler: () => {
            console.log('Agree clicked');
            this.http.post('http://localhost:7000/api/v1/content/' + this.myPublish[id]._id + '/destroy', {
              token: localStorage.getItem('user_token')
            }).subscribe(data => {
              // console.log(JSON.parse(data['_body']));
              this.myPublish.splice(id, 1)
            }, err => {
              console.log(err);
            });
          }
        }
      ]
    });
    confirm.present();
    
    
  }

  //时间戳转换时间
  timeTotime(time){
    let y = time.slice(5,10)
    let h = time.slice(11,16)
    return y+' '+h
  }
}
