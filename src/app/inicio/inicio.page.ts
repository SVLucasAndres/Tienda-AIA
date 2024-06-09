import { Component, OnInit } from '@angular/core';
import { InfoService } from '../info.service';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Database, object ,ref} from '@angular/fire/database';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  datos: any[] = [];
  carga: boolean = false;
  private menuAbierto = false;
  uid:any;
  constructor(private database: Database, public info: InfoService, private platform: Platform, private router: Router, private menuCtrl: MenuController, private navCtrl: NavController) { }
  carritoNumber: number = 0;
  ngOnInit() {
    this.info.getUid().subscribe(async res => {
      if (res != null) {
        this.datos = await this.info.obtenerBDD('UID', res?.uid);
        this.uid = await res?.uid;
        this.carga = true;
        console.log('clients/' + this.uid + '/carrito');
        const route = await ref(this.database, 'clients/'+this.uid+'/carrito');
        object(route).subscribe(attributes => {
          this.carritoNumber = 0;
          const carritoData = attributes.snapshot.val();
          if (carritoData) {
            console.log(carritoData);
            for (const key in carritoData) {
              if (carritoData.hasOwnProperty(key)) {
                const dato = carritoData[key] as datacar;
                const cuant = dato.cantidad;
                console.log(cuant);
                this.carritoNumber += cuant;
                console.log(this.carritoNumber);
              }
            }
            
          } else {
            console.log('No hay datos en el carrito');
          }
        });
      } else {
        this.info.irA('/home');
      }
    });
  }
  toGo(tabName:string){
    this.router.navigate([tabName]);
    this.navCtrl.navigateRoot(tabName);
  }
  abrirMenu() {
    this.info.toggleMenu();
  }

  esAndroid() {
    return this.platform.is('android');
  }
}
interface datacar {
  cantidad:number,
  nombre:string
}