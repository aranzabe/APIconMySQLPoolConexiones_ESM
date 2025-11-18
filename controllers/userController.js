import {response,request} from 'express';
import {Conexion} from '../database/Conexion.js';

const conx = new Conexion();

const controlador = {
    usuariosGet :  (req, res = response) => {
        conx.getlistado()    
            .then( msg => {
                console.log('🔵 Listado correcto!');
                res.status(200).json(msg);
            })
            .catch( err => {
                console.error('❌ Error:', err);
                // Error de conexión
                if (err && err.code === 'ER_ACCESS_DENIED_ERROR') {
                    return res.status(500).json({
                        error: 'Error de conexión a la Base de Datos (credenciales incorrectas)'
                    });
                }
                if (err && err.code === 'ECONNREFUSED') {
                    return res.status(500).json({
                        error: 'No se puede conectar al servidor MySQL'
                    });
                }
                // Sin resultados
                if (err === 'NO_ROWS') {
                    return res.status(404).json({
                        msg: 'No se han encontrado registros'
                    });
                }
                // Cualquier otro error
                res.status(500).json({
                    error: 'Error interno del servidor'
                });
        });
    },
    usuarioGet :  (req, res = response) => {
        conx.getUsuario(req.params.dni)    
            .then( msg => {
                console.log('🔵 Listado correcto!');
                res.status(200).json(msg);
            })
            .catch( err => {
               // Error de conexión
                if (err && err.code === 'ER_ACCESS_DENIED_ERROR') {
                    console.error('❌ Error:', err);
                    return res.status(500).json({
                        error: 'Error de conexión a la Base de Datos (credenciales incorrectas)'
                    });
                }
                // Sin resultados
                if (err === null || err === undefined || (Array.isArray(err) && err.length === 0)) {
                    console.error('‼️ No hay registros');
                    return res.status(404).json({
                        msg: 'No se han encontrado registros'
                    });
                }
                // Cualquier otro error
                console.error('❌ Error:', err);
                res.status(500).json({
                    error: 'Error interno del servidor' + err
                });
            });
    },
    usuariosPost :  (req = request, res = response) => {
        conx.registrarUsuario(req.body.dni, req.body.nombre, req.body.clave, req.body.tfno)    
            .then( msg => {
                console.log('🔵 Insertado correctamente!');
                res.status(201).json(msg);
            })
            .catch( err => {
                console.log('‼️ Fallo en el registro!');
                res.status(203).json(err);
            });
    },
    usuariosDelete :  (req, res = response) => {
        conx.borrarUsuario(req.params.dni)    
            .then( msg => {
                console.log('🔵 Borrado correctamente!');
                res.status(202).json(msg);
            })
            .catch( err => {
                console.log('‼️ Fallo en el borrado!');
                res.status(203).json(err);
            });
    },
    usuariosPut :  (req, res = response) => {
        conx.modificarUsuario(req.params.dni, req.body.nombre, req.body.clave, req.body.tfno)    
            .then( msg => {
                console.log('🔵 Modificado correctamente!');
                res.status(202).json(msg);
            })
            .catch( err => {
                console.log('‼️ Fallo en la modificación!');
                res.status(203).json(err);
            });
    }

}

export default controlador