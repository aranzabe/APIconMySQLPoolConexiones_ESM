import express from 'express';
import cors from 'cors';
import {router as userRoutes} from '../routes/userRoutes.js';
import kleur from 'kleur';


class Server {
    constructor() {
        this.app = express();
        this.usuariosPath = '/api';

        //Middlewares
        this.middlewares();

        //Rutas de la API
        this.routes();
        
    }

    middlewares() {
        //En esta sección cargamos una serie de herramientas necesarias para todas las rutas.
        //Para los middlewares como estamos acostumbrados a usarlos en Laravel ver userRoutes y userMiddlewares.
        //Para cors:
        this.app.use(cors());
        //Para poder recibir la información que venga del body y parsearla de JSON, necesitamos importar lo siguiente.
        this.app.use(express.json());
    }

    routes(){
        this.app.use(this.usuariosPath ,userRoutes);
    }

    //Método que será llamado desde app.js para poner a escuchar el servidor.
    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(kleur.green().bold(`🟢 Servidor escuchando en: ${process.env.PORT}`));
        })
    }
}

export {Server}