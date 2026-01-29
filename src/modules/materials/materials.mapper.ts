import {Injectable} from "@nestjs/common";
import {MaterialResponseDto} from "./dto/material-response.dto";
import {Material} from "./schemas/materials.schema";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {MaterialItemsResponseDto} from "./dto/material-items-response.dto";

@Injectable()
export class MaterialsMapper {

    toMaterialResponse(this: void, material: Material): MaterialResponseDto {
        let materialItems: MaterialItemsResponseDto[] = [];
        if (material.materialItems)
            materialItems = material.materialItems.map(item => ({
                originalFileName: item.originalFileName,
                displayUrl: getStaticUrl(item.contentReference)!
            }));
        return {
            _id: material._id!.toString(),
            title: material.title,
            description: material.description,
            materialItems: materialItems
        }
    }
}