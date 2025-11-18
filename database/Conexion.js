import mysql from 'mysql2';
import dotenv from 'dotenv';
import kleur from 'kleur';

dotenv.config();

class Conexion {

    constructor(options) {
        this.config = {
            host: process.env.DB_URL,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            connectionLimit: process.env.DB_MAXCONNECTIONS, //Por defecto son 10.
            port: process.env.DB_PORT
        };
        try{
            this.pool = mysql.createPool(this.config)
            //Probamos la conexión.
            this.pool.getConnection((err, connection) => {
            if (err) {
                console.error(kleur.red().bold('❌ Error en la conexión de la bd: '), err);
            } else {
                console.log(kleur.blue().bold('🔵 Conexión con la BD establecida con éxito'));
                connection.release();
            }});
        } catch(error) {
            console.log(kleur.blue().bold('❌ Error en la conexión de la bd: '), error)
        }
        

        //Cierra el pool al recibir SIGINT
        process.on('SIGINT', async () => {
            try {
                await this.pool.end(); // Libera todas las conexiones
                console.log(kleur.cyan().bold('✅ Conexiones con la BD cerradas correctamente.'));
                process.exit(0);
            } catch (error) {
                console.error(kleur.red().bold('Error al cerrar el pool:', error));
                process.exit(1);
            }
        });
    }


    query = ( sql, values ) => {
    //Devolver una promesa
    return new Promise(( resolve, reject ) => {
        this.pool.query(sql, values, ( err, rows) => {
            if ( err ) {
                reject( err )
            } else {
                // console.log('Llego aquí');
                if (rows.length === 0) {
                    reject(err);
                }
                resolve( rows )
            }
            })
        })
    }

    getlistado = async() => {
        let resultado = [];
        try {
            resultado = await this.query('SELECT * FROM personas');
        } catch (error) {
            throw error;
        }
        return resultado;
    }

    getUsuario = async(dni) => {
        let resultado = [];
        try {
            resultado = await this.query('SELECT * FROM personas WHERE dni = ?', [dni]);
        } catch (error) {
            throw error;
        }
        return resultado;
    }

    registrarUsuario = async(dni, nombre, clave, tfno) => {
        let resultado = 0;
        try {
            resultado = await this.query('INSERT INTO personas VALUES (?,?,?,?)', [dni, nombre, clave, tfno]);
        } catch (error) {
            throw error;
        }
        return resultado;
    }

    modificarUsuario = async(dni, nombre, clave, tfno) => {
        let resultado = 0;
        try {
            resultado = await this.query('UPDATE personas SET nombre=?,clave=?,tfno=? WHERE dni = ?', [nombre, clave, tfno, dni]);
        } catch (error) {
            throw error;
        }
        return resultado;
    }

    borrarUsuario = async(dni) => {
        let resultado = 0;
        try {
            resultado = await this.query('DELETE FROM  personas  WHERE dni = ?', [dni]);
        } catch (error) {
            throw error;
        }
        return resultado;
    }

    
}

export {Conexion}
