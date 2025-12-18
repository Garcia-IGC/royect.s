import React from 'react';
import { ViewType } from '../constants/navigation';
import { AuthDataDto } from '../types';
import SimuladorAvance from '../SimuladorAvance';
import MostradorAvances from '../MostradorAvances';
import Cursados from '../Cursados';
import Proyeccion from '../Proyeccion';
import AvanceView from '../Avance';

interface ViewRendererProps {
  currentView: ViewType;
  data: AuthDataDto;
  proyeccionEditando: any | null;
  onEditarProyeccion: (proyeccion: any) => void;
  onCancelarEdicion: () => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  data,
  proyeccionEditando,
  onEditarProyeccion,
  onCancelarEdicion,
}) => {
  return (
    <>
      {currentView === 'avance' && <AvanceView carreras={data.carreras} />}

      {currentView === 'cursados' && <Cursados carreras={data.carreras} />}

      {currentView === 'proyeccion' && <Proyeccion carreras={data.carreras} />}

      {currentView === 'simulador' && (
        <SimuladorAvance
          data={data}
          proyeccionEditar={proyeccionEditando}
          onCancelarEdicion={onCancelarEdicion}
        />
      )}

      {currentView === 'guardadas' && (
        <MostradorAvances
          rut={data.rut}
          onEditarProyeccion={onEditarProyeccion}
        />
      )}

    </>
  );
};

export default ViewRenderer;
