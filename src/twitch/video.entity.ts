import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { TwitchVideoStatuses } from "./video.type";

@Entity()
export class TwitchVideo {
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
}