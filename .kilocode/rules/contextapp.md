## CONTEXTAPP.md

CONTEXTO GENERAL DEL APP 

## CONTEXTO

crearemos una pwa con nextjs 15 y las tecnologias y arquietectura mencionada la app sera para manejar en diferentes dispositivos (computador, tablet, celular y panyallas de tv) sera para un taller mecanico, estara enfocada en el control del mismo por lo tanto necesitaremos un login donde pueda ingresar todo el personal tenga su perfil con datos importantes y algo fundamental su ROL en la empresa el cual va a permitir que informacion se le va a mostrar, la empresa se llama MAXIRENT, esta ubicada en monterrey nuevo leon mexico, se dedica a rentar vehiculos y camionestas pero esta app sera solo enfocada en los talleres los cuales mantienen los vehiculos en renta en optimo estado

una de las problematicas del taller es que no se tiene un buen control de los vehiculos que ingresan ni a quien se le asignan ni de los insumos que se gastan en cada vehiculo, se tuvo una reunion con los encargados y pidieron los siguientes requerimientos 

- Quieren saber que vehiculos ingresan en el dia llevar un control por el momento tienen algo muy manual una persona con una planilla anotando el ingreso de vehiculos, quieren mejorar eso
- deben saber como va el proceso del taller cuantos vehiculos tienen haciendo mantenimiento y donde estan y con que mecanico 
- tienen un numero de 7 rampas pero en ocaciones crean puestos de trabajo que no son rampas por esto se debe tener las rampas saber el estado por que pueden estar en mantenimiento y dado caso crear o eliminar espacios de trabajo.
- despues de hacer un ingreso de un vehiculo se tienen que manejar las debidas notificaciones en este caso notificar al jefe de taller el cual debera hacer la asignacion del vehiculo a un mecanico.
- este mecanico debera recibir la informacion de la asignacion del vehiculo a aceptar y elejir la rampa en la cual va a trabajar o espacio de trabajo, asi mismo dar una observacion de el estado del vehiculo de ser necesario.
- para el tema del login abra un ROL administrador el cual sera encargado de crear las cuentas y perfiles de los empleados por primera vez asignandole su rol y su clave, al momento de iniciar secion podra ser por medio de un usuario asignado o un telefono y pedir un codigo otp para el ingreso al sistema.

- abran unas pantallas o screen las cuales sera una pantalla general con todos los datos del taller cuantos vehiculos estan siendo revisados, pero aparte por rampa o espacio de trabajo abra una pantalla la cual muestre una card o info sobre mecanico asignado vehiculo en que estado va el mantenimiento observaciones y demas esto se debe generar conectado con la info ya confirmada despues de las notificaciones.

- posibles roles a necesitar ADMIN, JEFE DE TALLER, ALMACENISTA, RECEPCIONISTA, MECANICO.

- se quiere implementar soluciones moderna se inteligentes como analisis de datos, machine learning e ia para ayudar ademas no se quiere ningun dato sea casi ingresado de forma manual por esto todo debe ser sistematizado, solo con la placa del vehiculo o nombre del mecanico se pueda hacer el proceso o revisar buena estructura y tipado de datos.