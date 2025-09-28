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
        const resultados = [];
        for (const carrera of datosAuth.carreras) {
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${carrera.codigo}-${carrera.catalogo}`;
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: { 'X-HAWAII-AUTH': 'jf400fejof13f' } }));
                resultados.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: response.data,
                });
            }
            catch (error) {
                console.error(`Error al obtener malla de ${carrera.codigo}-${carrera.catalogo}`, error.message);
                resultados.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: [],
                    error: true
                });
            }
        }
        return resultados;
    }
};
exports.MallaService = MallaService;
exports.MallaService = MallaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MallaService);
//# sourceMappingURL=malla.service.js.map