export type Sensor = {
    id: number;
    nome: string;
    tipo: string;
    unidade: string;
    limiteMinimo?: number;
    limiteMaximo?: number;
    ativo?: boolean;
};

export type StatusMedicao = "normal" | "alerta" | "critico";

export type Medicao = {
    id: number;
    sensor: Sensor;
    valor: number;
    data: Date;
    status: StatusMedicao;
};