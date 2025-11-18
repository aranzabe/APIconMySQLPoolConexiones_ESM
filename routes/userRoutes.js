import { Router } from 'express';
import controlador from '../controllers/userController.js'
export const router = Router();

//El segundo parámetro (optativo) son los middlewares.
router.get('/', controlador.usuariosGet);
router.get('/:dni', controlador.usuarioGet);
router.post('/', controlador.usuariosPost);
router.put('/:dni', controlador.usuariosPut);
router.delete('/:dni', controlador.usuariosDelete);

//Formas de agrupar rutas. Lo del middleware podría ir en la clase server pero quizá sea más entendible aquí, justo antes de la agrupación de rutas.
// router.use('/acceso',[mids.otroMiddleware, mids.esMayor]); //Para agrupar rutas y aplicarles middlewares.
// router.route('/acceso') 
//     .get((req, res) => { 
//         res.status(200).json({'msg':'Acceso con get!!'});
//     })
//     .post( (req, res) => {
//         res.status(202).json({'msg':'Acceso con post!!'});
//     });

