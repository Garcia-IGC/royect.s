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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProyeccionController = void 0;
const common_1 = require("@nestjs/common");
const proyeccion_service_1 = require("./proyeccion.service");
let ProyeccionController = class ProyeccionController {
    proyeccionService;
    constructor(proyeccionService) {
        this.proyeccionService = proyeccionService;
    }
    async guardar(data) {
        return this.proyeccionService.guardarProyeccion(data);
    }
    async obtenerPorRut(rut) {
        return this.proyeccionService.obtenerProyeccionesPorRut(rut);
    }
    async obtenerPorId(id) {
        return this.proyeccionService.obtenerProyeccionPorId(parseInt(id));
    }
    async eliminar(id) {
        return this.proyeccionService.eliminarProyeccion(parseInt(id));
    }
    async actualizar(id, data) {
        return this.proyeccionService.actualizarProyeccion(parseInt(id), data);
    }
};
exports.ProyeccionController = ProyeccionController;
__decorate([
    (0, common_1.Post)('guardar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProyeccionController.prototype, "guardar", null);
__decorate([
    (0, common_1.Get)('obtener/:rut'),
    __param(0, (0, common_1.Param)('rut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProyeccionController.prototype, "obtenerPorRut", null);
__decorate([
    (0, common_1.Get)('detalle/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProyeccionController.prototype, "obtenerPorId", null);
__decorate([
    (0, common_1.Delete)('eliminar/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProyeccionController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Put)('actualizar/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProyeccionController.prototype, "actualizar", null);
exports.ProyeccionController = ProyeccionController = __decorate([
    (0, common_1.Controller)('proyeccion'),
    __metadata("design:paramtypes", [proyeccion_service_1.ProyeccionService])
], ProyeccionController);
//# sourceMappingURL=proyeccion.controller.js.map