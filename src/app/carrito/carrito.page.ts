import { Component, OnInit } from '@angular/core';
import { InfoService } from '../info.service';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { get, ref, remove, set, update } from 'firebase/database';
import { Database, object } from '@angular/fire/database';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {
  datos: any[] = [];
  botonPagar:boolean = true;
  carga: boolean = false;
  private menuAbierto = false;
  uid:any;
  carritoNumber:number = 0;
  carritoItems:any[]=[];
  totalPrice:number = 0;
  iva:number = 0;
  finalPrice:number = 0;
  productoString:string = "";
  cedula:string = "";
  nombre:any;
  direccion:any;
  correo:any;
  telefono:any;
  retiro:any;
  constructor(private database:Database,public info: InfoService, private platform: Platform, private router: Router, private menuCtrl: MenuController, private navCtrl: NavController) { }
  verificarcedula(cedula:string){
    let val=0;
    for(let i = 0;i<9;i++){
      const j = parseInt(cedula.charAt(i));
      
      if(i%2!=0){
        val += j;
      }else{
        if(j*2 > 9){
          val += j*2 - 9;
        }else{
          val += j*2;
        }
      }
    }
    if(10 - val%10 == parseInt(cedula.charAt(9))){
      return true;
    }else{
      return false;
    }
  }
  generateRandomId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  pay() {
    const billingData = {
      cedula: this.cedula,
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      direccion: this.direccion
    };
  
    this.info.presentAlertInput(
      'Paso 1',
      'Ingresa tus datos de facturación',
      [
        {
          text: 'Salir',
          handler: () => {
            console.log("canceló");
          }
        },
        {
          text: 'Siguiente',
          handler: (data: any) => {
            billingData.cedula = data[0];
            billingData.nombre = data[1];
            billingData.correo = data[2];
            billingData.telefono = data[3];
            billingData.direccion = data[4];
            
            if (
              !billingData.cedula ||
              !billingData.nombre ||
              !billingData.correo ||
              !billingData.telefono ||
              !billingData.direccion
              
              
            ) {
              this.info.presentToast('Todos los campos son obligatorios', 'top', 'warning', 'alert');
              
            }else if(!this.verificarcedula(billingData.cedula)){
              this.info.presentToast('Cédula incorrecta', 'top', 'warning', 'alert');
            }
              else{
              this.info.presentAlertInput(
                'Paso 2',
                'Retiro del producto',
                [
                  {
                    text: 'Salir',
                    handler: () => {
                      console.log("canceló");
                    }
                  },
                  {
                    text: 'Siguiente',
                    handler: (data: any) => {
                      if(data == 'Retiro'){
                        this.info.presentAlertInput(
                          'Paso 3',
                          'Método de pago',
                          [
                            {
                              text: 'Salir',
                              handler: () => {
                                console.log("canceló");
                              }
                            },
                            {
                              text: 'Siguiente',
                              handler: (data: any) => {
                                if(data == 'Efectivo'){
                                  const code = this.generateRandomId(12);
                                  for(const item of this.carritoItems){
                                    this.productoString += item.cuant+ ' ' + item.name;
                                  }
                                  console.log("Code: "+code+'Productos: '+this.productoString);
                                  set(ref(this.database,'pedidos/'+ this.uid + code),{estado: 'Por reservar', reserva: this.productoString, precio: this.totalPrice , cliente: billingData.nombre, cedula: billingData.cedula});
                                  this.info.presentAlert('Proceso finalizado','Desde que el estado de tu orden sea Listo, estará reservada por 15 días. Acude al taller de Asistencia Integral Automotriz para retirarla y emitir la factura. Deberás mostrar el código QR para hacerlo. ¡Gracias por tu compra!',[
                                    {
                                      text:'Descargar QR',
                                      handler:() => {
                                        
                                      }
                                    }
                                  ])
                                }
                              }
                            }
                          ],
                          [
                            {
                              value: 'Efectivo',
                              type: 'radio',
                              label: 'En efectivo (Al retirar del local)'
                              
                            },
                            {
                              value: 'Transferencia',
                              type: 'radio',
                              label: 'Por transferencia (Banco Pichincha)'
                            },
                            {
                              value: 'Payphone',
                              type: 'radio',
                              label: 'En línea (PayPhone)'
                            }
                          ]
                        );
                      }else{
                        this.info.presentAlertInput(
                          'Paso 3',
                          'Método de pago',
                          [
                            {
                              text: 'Salir',
                              handler: () => {
                                console.log("canceló");
                              }
                            },
                            {
                              text: 'Siguiente',
                              handler: (data: any) => {
                              
                              }
                            }
                          ],
                          [
                            {
                              value: 'Transferencia',
                              type: 'radio',
                              label: 'Por transferencia (Banco Pichincha)'
                            },
                            {
                              value: 'Payphone',
                              type: 'radio',
                              label: 'Con tarjeta (PayPhone)'
                            }
                          ]
                        );
                      }
                      
                    }
                  }
                ],
                [
                  {
                    value: 'Dentro Cuenca',
                    type: 'radio',
                    label: 'Envío dentro del cantón Cuenca'
                  },
                  {
                    value: 'Fuera Cuenca',
                    type: 'radio',
                    label: 'Envío fuera del cantón Cuenca'
                  },
                  {
                    value: 'Retiro',
                    type: 'radio',
                    label: 'Retirar en el local'
                  }
                ]
              );
            }
            
          }
        }
      ],
      [
        {
          placeholder: 'Cédula',
          attributes: { maxlength: 10 , minlength:10},
          value: billingData.cedula
        },
        {
          placeholder: 'Razón Social',
          value: billingData.nombre
        },
        {
          placeholder: 'Correo electrónico',
          value: billingData.correo
        },
        {
          placeholder: 'Celular',
          value: billingData.telefono
        },
        {
          placeholder: 'Dirección',
          value: billingData.direccion
        }
      ]
    );
  }
  
  
  ngOnInit() {
    this.carga=true;
    this.info.getUid().subscribe(async res => {
      if (res != null) {
        
        this.datos = await this.info.obtenerBDD('UID', res?.uid);
        this.uid = await res?.uid;
        this.carga = true;
        console.log('clients/' + this.uid + '/carrito');
        const route = await ref(this.database, 'clients/'+this.uid+'/carrito');
        
        object(route).subscribe(attributes => {
          this.carritoNumber = 0;
          this.carritoItems = [];
          const carritoData = attributes.snapshot.val();
          if (carritoData) {
            console.log(carritoData);
            for (const key in carritoData) {
              if (carritoData.hasOwnProperty(key)) {
                const dato = carritoData[key] as datacar;
                const cuant = dato.cantidad;
                const name = dato.nombre;
                this.totalPrice = 0;
                object(ref(this.database,'productos')).subscribe(async attributes => {
                  await attributes.snapshot.forEach(element => {
                    
                    const dato1 = element.val() as datauser;
                    const product = dato1.producto;
                    const precio = dato1.precio * cuant;
                    
                    if(product == name){
                      this.carritoNumber += cuant;
                      this.carritoItems.push({cuant,name,precio});
                      this.totalPrice += parseFloat(precio.toFixed(2));
                      this.iva = parseFloat((this.totalPrice * 0.12).toFixed(2));
                      this.finalPrice = parseFloat((this.totalPrice + this.iva).toFixed(2));
                    }
                  });
                });
                
                this.botonPagar = false;
                this.carga=false;
              }
            }
            
          } else {
            console.log('No hay datos en el carrito');
            this.carga=false;
            this.totalPrice = 0;
            this.iva = 0;
            this.finalPrice = 0;
            this.botonPagar = true;
          }
        });
      } else {
        this.info.irA('/home');
        this.carga=false;
      }
    });
    
  }
  async delAll(product:any){
    this.carga=true;
    const route = ref(this.database, 'clients/' + this.uid + '/carrito');
    const carritoSnapshot = await get(route);
    const carritoData = carritoSnapshot.val();
    
    if (carritoData) {
      const dato = carritoData[product] as datacar;
      this.carritoItems = [];
      await remove(ref(this.database, 'clients/' + this.uid + '/carrito/' + product));
    } else {
      console.log('No hay datos en el carrito');
    }
    this.carga=false;
  }
  async delOne(product: any) {
    this.carga=true;
    const route = ref(this.database, 'clients/' + this.uid + '/carrito');
    const carritoSnapshot = await get(route);
    const carritoData = carritoSnapshot.val();
    
    if (carritoData) {
      const dato = carritoData[product] as datacar;
      this.carritoItems = [];
      if (dato && dato.cantidad > 0) {
        const newCantidad = dato.cantidad - 1;
        if (newCantidad > 0) {
          await update(ref(this.database, 'clients/' + this.uid + '/carrito/' + product), { cantidad: newCantidad });
        } else {
          await remove(ref(this.database, 'clients/' + this.uid + '/carrito/' + product));
        }
      }
    } else {
      console.log('No hay datos en el carrito');
    }
    this.carga=false;
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
interface datauser {
  GM: number;
  cantidad: number;
  descripcion: string;
  imagen: string;
  precio: number;
  producto: string;
}