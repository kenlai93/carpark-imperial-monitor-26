import axios from "axios";
import dayjs from "dayjs";
import { setTimeout } from "timers/promises";
import { MERCHANT_ID, VEHICLE_TYPE } from "./constants.mjs";

const main = async () => {
    const start = dayjs(new Date());
    const end = start.endOf("month");

    // https://api-enterprise.letspark.com.hk/api/spaces/v2/5d6faa5ae250c83ffe1e5714
    const { data: spacePaginationResponse } = await axios.get(
        `https://api-enterprise.letspark.com.hk/api/spaces/v2/${MERCHANT_ID}`,
        {
            params: {
                type: "Monthly",
                length: 9999,
                page: 1,
                vehicle: VEHICLE_TYPE.PRIVATE_CAR,
                start: start.format("YYYY-MM-DDTHH:mm"),
                end: end.format("YYYY-MM-DDTHH:mm"),
            },
        }
    );

    const availableSpaces = await Promise.all(
        spacePaginationResponse.data.map(
            async ({
                _id: spaceId,
                data: {
                    carpark_id: { name_tc, address_tc, ...rest },
                },
            }) => {
                const { data: spaceDetailsResponse } = await axios.get(
                    `https://api-enterprise.letspark.com.hk/api/spaces/carpark/${spaceId}`,
                    {
                        params: {
                            type: "Monthly",
                        },
                    }
                );

                for (const { data } of spaceDetailsResponse) {
                    const hasQuota = data.quota > data.booked.length;
                    if (data.cartype.includes(VEHICLE_TYPE.PRIVATE_CAR) && hasQuota) {
                        return {
                            address_tc,
                            name_tc,
                            price: data.monthly?.price,
                            url: `https://www.impark.com.hk/carparkdetail/${spaceId}`,
                        };
                    }

                    return null;
                }
            }
        )
    );

    const sortedAvailableSpaces = availableSpaces
        .filter((res) => !!res)
        .sort((a, b) => (a.price > b.price ? -1 : 1));

    for (const { address_tc, name_tc, price, url } of sortedAvailableSpaces) {
        console.log(address_tc, name_tc, price, url);
    }
};

main();
