import type {
  GetResponse as LayoutAPIResponse,
  Layout,
} from '@100mslive/types-prebuilt';

export async function parseRoomLayout(response: string): Promise<Layout> {
  try {
    const parsedResponse: LayoutAPIResponse = JSON.parse(response);
    if (!parsedResponse.data) {
      return Promise.reject('Layout API response is corrupted!');
    }

    const firstLayout = parsedResponse.data[0];
    if (!firstLayout) {
      return Promise.reject('No Layout found for the Room!');
    }

    return firstLayout;
  } catch (error) {
    return Promise.reject(error);
  }
}
