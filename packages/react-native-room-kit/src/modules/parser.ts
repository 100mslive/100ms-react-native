import type {
  GetResponse as LayoutAPIResponse,
  Layout,
} from '@100mslive/types-prebuilt';

export async function parseRoomLayout(response: string): Promise<Layout[]> {
  try {
    const parsedResponse: LayoutAPIResponse = JSON.parse(response);
    if (!parsedResponse.data) {
      return Promise.reject('Layout API response is corrupted!');
    }

    if (parsedResponse.data.length <= 0) {
      return Promise.reject('No Layout found for the Room!');
    }

    return parsedResponse.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
