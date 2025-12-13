"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MallaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let MallaService = class MallaService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async obtenerMallas(datosAuth) {
        console.log('obteniendo mallas');
        const resultadoFinal = {
            rut: datosAuth.rut,
            carreras: []
        };
        for (const carrera of datosAuth.carreras) {
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${carrera.codigo}-${carrera.catalogo}`;
            try {
                const hawaiiAuth = process.env.HAWAII_AUTH;
                if (!hawaiiAuth || hawaiiAuth === 'TU_TOKEN_DE_AUTENTICACION_AQUI') {
                    console.error('❌ HAWAII_AUTH no configurado en .env');
                    throw new Error('Token de autenticación no configurado');
                }
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: { 'X-HAWAII-AUTH': hawaiiAuth } }));
                resultadoFinal.carreras.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: response.data,
                });
            }
            catch (error) {
                let errorMessage = error.message;
                if (error.response?.status === 401) {
                    errorMessage = 'Token de autenticación inválido o expirado (401)';
                    console.error(`❌ ${errorMessage} - Verifica HAWAII_AUTH en .env`);
                }
                else {
                    console.error(`❌ Error al obtener malla de ${carrera.codigo}-${carrera.catalogo}:`, errorMessage);
                }
                resultadoFinal.carreras.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: [],
                    error: true
                });
            }
        }
        return resultadoFinal;
    }
    async obtenerAvance(resultadoFinal) {
        const avances = [];
        console.log('obteniendo avances');
        for (const carrera of resultadoFinal.carreras) {
            const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${resultadoFinal.rut}&codcarrera=${carrera.codigo}`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                    headers: { 'X-HAWAII-AUTH': process.env.HAWAII_AUTH }
                }));
                avances.push({
                    carrera: carrera.carrera,
                    codigo: carrera.codigo,
                    avances: response.data
                });
            }
            catch (error) {
                console.error(`Error al obtener avance de ${carrera.codigo}`, error.message);
                avances.push({
                    carrera: carrera.carrera,
                    codigo: carrera.codigo,
                    avances: [],
                    error: true
                });
            }
        }
        return avances;
    }
    async combinarMallaYAvance(resultadoFinal) {
        const avances = await this.obtenerAvance(resultadoFinal);
        for (const carrera of resultadoFinal.carreras) {
            const avanceCarrera = avances.find(a => a.codigo === carrera.codigo);
            if (!avanceCarrera || avanceCarrera.error) {
                carrera.malla = carrera.malla.map(ramo => ({
                    ...ramo,
                    status: 'NO CURSADO',
                    cursada: false,
                    intento: 0
                }));
                continue;
            }
            carrera.malla = carrera.malla.map(ramo => {
                const resultadosRamo = avanceCarrera.avances.filter(a => a.course === ramo.codigo);
                if (ramo.intento == null) {
                    ramo.intento = 0;
                }
                let intentos = 0;
                let statusFinal = 'NO CURSADO';
                if (resultadosRamo.length > 0) {
                    for (const resultado of resultadosRamo) {
                        if (resultado.status === 'APROBADO' || resultado.status === 'REPROBADO') {
                            intentos += 1;
                        }
                        statusFinal = resultado.status;
                    }
                }
                ramo.intento = intentos;
                return {
                    ...ramo,
                    status: statusFinal,
                    cursada: resultadosRamo.length > 0,
                };
            });
        }
        return resultadoFinal;
    }
};
exports.MallaService = MallaService;
exports.MallaService = MallaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MallaService);
//# sourceMappingURL=malla.service.js.map