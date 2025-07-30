import { TherapyListModel } from "./therapy.list.model";

export interface TherapyTypeListModel {
    id: string;
    name: string;
    bannerPictureUrl: string;
    therapies: TherapyListModel[];
}