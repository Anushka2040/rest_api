interface petInterface {
  id: string;
  category: { id: number; name: string };
  name: string;
  photoUrls: string;
  tags: [{ id: number; name: string }];
  status: string;
}

export { petInterface };
