import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Material} from "./schemas/materials.schema";
import {Model, QueryFilter, UpdateQuery} from "mongoose";

@Injectable()
export class MaterialsRepository {

    constructor(
        @InjectModel(Material.name) private readonly materialsModel: Model<Material>
    ) {
    }

    async createMaterial(material: Material) {
        return this.materialsModel.create(material);
    }

    async updateMaterial(query: QueryFilter<Material>, updatedVal: UpdateQuery<Material>) {
        return this.materialsModel.findOneAndUpdate(query, updatedVal, {new: true});
    }

    async findAll(query: QueryFilter<Material>, select: Record<string, boolean>) {
        return this.materialsModel.find(query)
            .sort({createdAt: -1})
            .select(select)
    }

    async findOne(query: QueryFilter<Material>) {
        return this.materialsModel.findOne(query);
    }

    async findMaterialOwner(query: QueryFilter<Material>) {
        return this.materialsModel.findOne(query)
            .select({materialItems: false})
            .populate({
                path: 'course',
                select: 'instructor',
                populate: {
                    path: 'instructor',
                    select: '_id'
                }
            });
    }

    async deleteAndReturn(query: QueryFilter<Material>) {
        return this.materialsModel.findOneAndDelete(query);
    }
}
