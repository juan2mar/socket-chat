const { io } = require('../server');

const {Usuarios} = require('../classes/usuarios'); 
const {crearMensaje} = require('../utilities/utilities');
const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) => {

        if(!usuario.nombre || !usuario.sala){
            return callback({
                error:false,
                message: 'El nombre/sala es necesario'
            });
        }
        client.join(usuario.sala);

        let personas = usuarios.agregarPersona( client.id, usuario.nombre, usuario.sala);
        
        client.broadcast.to(usuario.sala).emit('listaPersona', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala());
    
    });

    client.on('crearMensaje',(data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        // Enviando mensajes a un chat grupal
        client.broadcast.emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {
        let personasBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personasBorrada.sala).emit('crearMensaje', crearMensaje('Administrador',`${personasBorrada.nombre}`));
        client.broadcast.to(personasBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personasBorrada.sala));

    });

    //Mensajes privados
    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
        
    });
});