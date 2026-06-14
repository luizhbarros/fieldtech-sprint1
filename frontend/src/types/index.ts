export type Sensor = {
    id: number;
    nome: string;
    tipo: string;
    unidade: string;
};

export type StatusMedicao = "normal" | "alerta" | "critico";

export type Medicao = {
    id: number;
    sensor: Sensor;
    valor: number;
    data: Date;
    status: StatusMedicao;
};