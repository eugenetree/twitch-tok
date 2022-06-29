import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

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
  status:
    "idle" |
    "handle-progress" |
    "handle-success" |
    "handle-error" |
    "render-progress" |
    "render-success" |
    "render-error" | 
    "upload-success" | 
    "upload-progress" |
    "upload-error"
}