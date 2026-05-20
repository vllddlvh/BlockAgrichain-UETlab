package BlockchainAgridence.uet.modules.masterdata.service;

import BlockchainAgridence.uet.modules.masterdata.entity.MasterProductCategory;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import BlockchainAgridence.uet.modules.masterdata.repository.MasterProductCategoryRepository;
import BlockchainAgridence.uet.modules.masterdata.repository.MasterUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final MasterProductCategoryRepository categoryRepository;
    private final MasterUnitRepository unitRepository;

    @Transactional(readOnly = true)
    public List<MasterProductCategory> getAllCategories() {
        return categoryRepository.findAllByIsDeletedFalse();
    }

    @Transactional(readOnly = true)
    public List<MasterUnit> getAllUnits() {
        return unitRepository.findAllByIsDeletedFalse();
    }
}