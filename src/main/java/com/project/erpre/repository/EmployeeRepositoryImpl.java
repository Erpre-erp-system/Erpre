package com.project.erpre.repository;

import com.project.erpre.model.entity.Employee;
import com.project.erpre.model.entity.QDepartment;
import com.project.erpre.model.entity.QEmployee;
import com.project.erpre.model.entity.QJob;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import javax.persistence.EntityManager;
import java.util.List;

public class EmployeeRepositoryImpl implements EmployeeRepositoryCustom {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeRepositoryImpl.class);

    private final JPAQueryFactory queryFactory;

    public EmployeeRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }

    // 1. 직원 검색 (직원 이름, 부서명, 직급명)
    @Override
    public Page<Employee> getEmployeeList(Pageable pageable, String searchKeyword) {
        QEmployee employee = QEmployee.employee;
        QDepartment department = QDepartment.department;
        QJob job = QJob.job;

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(employee.employeeDeleteYn.eq("N"));
        builder.and(containsKeyword(searchKeyword));

        List<Employee> results = queryFactory
                .selectFrom(employee)
                .leftJoin(employee.department, department).fetchJoin()
                .leftJoin(employee.job, job).fetchJoin()
                .where(builder)
                .orderBy(department.departmentName.asc(), employee.employeeName.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 총 개수 계산
        long total = queryFactory.selectFrom(employee)
                .where(builder)
                .fetchCount();

        return new PageImpl<>(results, pageable, total);
    }


    // 2. 현재 로그인한 직원 조회
    @Override
    public Employee getLoginEmployee(String employeeId) {
        QEmployee employee = QEmployee.employee;
        QDepartment department = QDepartment.department;
        QJob job = QJob.job;

        return queryFactory
                .selectFrom(employee)
                .leftJoin(employee.department, department).fetchJoin()
                .leftJoin(employee.job, job).fetchJoin()
                .where(employee.employeeId.eq(employeeId))
                .fetchOne();

    }

    // 3. 검색어와 상태 필터에 따른 메신저 조직도 조회
    @Override
    public List<Employee> getMessengerEmployeeList(String status, String searchKeyword) {
        QEmployee employee = QEmployee.employee;
        QDepartment department = QDepartment.department;
        QJob job = QJob.job;

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(employee.employeeDeleteYn.eq("N"));
        builder.and(statusFilter(status));
        builder.and(containsKeyword(searchKeyword));

        return queryFactory
                .selectFrom(employee)
                .leftJoin(employee.department, department).fetchJoin()
                .leftJoin(employee.job, job).fetchJoin()
                .where(builder)
                .orderBy(department.departmentName.asc(), employee.job.jobId.asc(), employee.employeeName.asc()) // 부서, 부서 내 직급, 직급 내 이름 순 정렬
                .fetch();
    }

    // 직원 검색 메서드 (직원, 부서, 직급)
    private BooleanExpression containsKeyword(String searchKeyword) {
        if (searchKeyword == null || searchKeyword.isEmpty()) {
            return null;
        }
        QEmployee employee = QEmployee.employee;
        QDepartment department = QDepartment.department;
        QJob job = QJob.job;

        return employee.employeeName.containsIgnoreCase(searchKeyword)
                .or(department.departmentName.containsIgnoreCase(searchKeyword))
                .or(job.jobName.containsIgnoreCase(searchKeyword));
    }

    // 직원 상태 메서드 (온라인, 오프라인)
    private BooleanExpression statusFilter(String status) {
        QEmployee employee = QEmployee.employee;

        if ("all".equals(status)) {
            return null;
        } else if ("offline".equals(status)) {
            return employee.employeeStatus.eq("offline");
        } else if ("online".equals(status)) {
            return employee.employeeStatus.ne("offline");
        }
        return null;
    }

}

