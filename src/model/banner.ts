export class Banner {
  constructor(
    public uuid: string,
    public firestore_paths: string,
    public banner_group: string,
    public order: number,
  ) {}
}
