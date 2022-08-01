import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum VideoEntityStatuses {
  "IDLE" = "IDLE",
  "PREPARE_IN_PROGRESS" = "PREPARE_IN_PROGRESS",
  "PREPARE_SUCCESS" = "PREPARE_SUCCESS",
  "PREPARE_ERROR" = "PREPARE_ERROR",
  "RENDER_IN_PROGRESS" = "RENDER_IN_PROGRESS",
  "RENDER_SUCCESS" = "RENDER_SUCCESS",
  "RENDER_ERROR" = "RENDER_ERROR",
  "UPLOAD_IN_PROGRESS" = "UPLOAD_IN_PROGRESS",
  "UPLOAD_SUCCESS" = "UPLOAD_SUCCESS",
  "UPLOAD_ERROR" = "UPLOAD_ERROR",
}

@Entity()
export class VideoEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  authorName: string;

  @Column()
  status: VideoEntityStatuses;

  @Column()
  languageOriginal: string;

  @Column()
  languageFromConfig: string;

  @Column()
  gameId: string;  
}