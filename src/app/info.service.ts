import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore } from '@angular/fire/firestore';
import { AlertController, MenuController, NavController, ToastController } from '@ionic/angular';

import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private menuAbierto = false;
  constructor(private menuCtrl:MenuController,private route:NavController,private alertController: AlertController,private toastController:ToastController, private db:Firestore, private auth:AngularFireAuth) {
    
  }
  async presentToast(message:any,position: 'top' | 'middle' | 'bottom',color?:any,icon?:any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: position,
      color:color,
      icon:icon,
    });
    await toast.present();
  }
  ruta:any
  async agregarBDD(link1:any,link2:any,parameters:{}){
    this.ruta = doc(this.db,link1,link2);
    await setDoc(this.ruta,parameters);
  }
  async registrar(user: string, pass: string) {
   return await this.auth.createUserWithEmailAndPassword(user, pass);   
  }
  getUid(){
    return this.auth.authState;
  }
  mostrarCargando(){
    
  }
  users:any[]=[];
  async login(user: string, pass: string):Promise<any>{
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(user, pass);
      const userVerified = userCredential.user?.emailVerified;
      console.log(userCredential.user?.uid);
      if (userVerified) {
          return 'Verificado';
      } else {
          throw new Error('NoVerificado');
      }
  } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
  }
  }
  async presentAlert(title:any,message:any,buttons:any[]) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: buttons,
      backdropDismiss: false
    });

    await alert.present();
  }
  async presentAlertRadio(title:any,message:any,buttons:any[],inputs:any[]) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: buttons,
      inputs:inputs,
      backdropDismiss: false
    });

    await alert.present();
  }
  async presentAlertInput(title:any,message:any,buttons:any[],inputs:any[]) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: buttons,
      inputs:inputs,
      backdropDismiss: false
    });

    await alert.present();
  }
  irA(ruta:any){
    this.route.navigateRoot(ruta);
  }
  async olvideContra(email:any){
   await this.auth.sendPasswordResetEmail(email);
  }
  async toggleMenu() {
    this.menuAbierto = await !this.menuAbierto;
    await this.menuCtrl.enable(this.menuAbierto, 'main-menu');
  }
  cerrarSesion(){
    try{
      this.auth.signOut();
      console.log("cerrado sesion correctamente");
    }catch(error){
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  }
  async obtenerBDD(attribute:any,filter:any):Promise<any[]>{
    const users:any[]=[];
    this.ruta = collection(this.db,'Registros');
    const ref = query(this.ruta,where(attribute,'==', filter));
    const consulta = await getDocs(ref);
    consulta.forEach(element => {
      const dato = element.data() as Registro;
      const usuario = dato.user;
      const mail = dato.mail;
      const fechaNac = dato.fechaNacimiento;
      users.push(usuario,mail,fechaNac);
    });
    return users;
  }
}
interface Registro{
  user:any,mail:any,fechaNacimiento:any
}
