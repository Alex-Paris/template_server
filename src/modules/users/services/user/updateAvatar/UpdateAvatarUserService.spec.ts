import { User } from "@modules/users/infra/typeorm/entities/User";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";

import { MockStorageProvider } from "@shared/containers/providers/StorageProvider/mocks/MockStorageProvider";

import { UpdateAvatarUserError } from "./UpdateAvatarUserError";
import { UpdateAvatarUserService } from "./UpdateAvatarUserService";

let mockUsersRepository: MockUsersRepository;
let mockStorageProvider: MockStorageProvider;
let updateAvatarUser: UpdateAvatarUserService;

let testUser: User;

describe("Update Avatar User Service", () => {
  beforeAll(async () => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();

    // Create user in mock for session tests.
    testUser = await mockUsersRepository.create({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });
  });

  beforeEach(() => {
    // Getting mocks components for service.
    mockStorageProvider = new MockStorageProvider();
    updateAvatarUser = new UpdateAvatarUserService(
      mockUsersRepository,
      mockStorageProvider
    );
  });

  it("should be able to update user avatar", async () => {
    const response = await updateAvatarUser.execute({
      userId: testUser.id,
      avatarFileName: "avatar.jpg",
    });

    expect(response.avatar).toBe("avatar.jpg");
  });

  it("should not be able to update avatar from non existing user", async () => {
    await expect(
      updateAvatarUser.execute({
        userId: "invalid-id",
        avatarFileName: "avatar.jpg",
      })
    ).rejects.toBeInstanceOf(UpdateAvatarUserError.NotAuthenticatedUser);
  });

  it("should delete old avatar when updating with a new one", async () => {
    const spyDeleteFile = jest.spyOn(mockStorageProvider, "deleteFile");

    await updateAvatarUser.execute({
      userId: testUser.id,
      avatarFileName: "avatar.jpg",
    });

    const response = await updateAvatarUser.execute({
      userId: testUser.id,
      avatarFileName: "avatar2.jpg",
    });

    expect(spyDeleteFile).toHaveBeenCalledWith("avatar.jpg");
    expect(response.avatar).toBe("avatar2.jpg");
  });
});
