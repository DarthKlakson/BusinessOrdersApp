export type RootTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Clients: undefined;
  Orders: undefined;
  Admin: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  OrderDetails: { orderId: number };
};
