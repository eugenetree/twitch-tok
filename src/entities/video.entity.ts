import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { TwitchVideoStatuses } from "./video.type";

@Entity()
export class TwitchVideo { // TODO: rename it to different name, TwitchVideoEntity, etc. Maybe move it to some other fodler
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  creatorName: string;

  @Column({ nullable: true, unique: true })
  remoteClipUrl: string;

  @Column({ nullable: true })
  localVideoPath: string;

  @Column()
  status: TwitchVideoStatuses;

  @Column()
  languageOriginal: string;

  @Column()
  languageFromConfig: string;

  @Column()
  gameId: string;  
}